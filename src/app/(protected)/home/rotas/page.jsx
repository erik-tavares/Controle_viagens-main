"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Modal from "react-modal";
import AddressForm from "@/components/dashboard/page";
import base64String from "@/core/clients/base64/base64File";
import styles from "./styles.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilter } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import Select from "react-select";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    driver: "",
    radius: "",
    status: "",
    vehicle: "",
    startTime: "",
    startTimeExpected: "",
    endTime: "",
    endTimeExpected: "",
    startCity: "",
    endCity: "",
    additionalDestinations: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();
  const [numbers, setNumbers] = useState(["5551998886750"]); // 🔹 Inicializando a lista com um número padrão
  const [newNumber, setNewNumber] = useState(""); // 🔹 Estado para armazenar um novo número
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado da modal
  const [isHovered, setIsHovered] = useState(false);

  // 🔹 Carregar números do LocalStorage ao iniciar
  useEffect(() => {
    const storedNumbers = JSON.parse(localStorage.getItem("phoneNumbers")) || [
      "5551998886750",
    ];
    console.log("📞 Números carregados do LocalStorage:", storedNumbers); // DEBUG
    setNumbers(storedNumbers);
  }, []);

  // 🔹 Função para salvar os números no LocalStorage
  const saveNumbersToLocalStorage = (updatedNumbers) => {
    localStorage.setItem("phoneNumbers", JSON.stringify(updatedNumbers));
    setNumbers(updatedNumbers);
  };

  // 🔹 Função para adicionar um novo número
  const addNumber = () => {
    if (newNumber.trim() !== "" && !numbers.includes(newNumber)) {
      const updatedNumbers = [...numbers, newNumber];
      saveNumbersToLocalStorage(updatedNumbers);
      setNewNumber("");
    }
  };

  // 🔹 Função para remover um número
  const removeNumber = (index) => {
    const updatedNumbers = numbers.filter((_, i) => i !== index);
    saveNumbersToLocalStorage(updatedNumbers);
  };
  const statusOptions = [
    {
      value: "",
      label: "Todos",
    },
    {
      value: "Em trânsito",
      label: (
        <>
          <span style={{ color: "red", fontSize: "25px", marginRight: "8px" }}>
            ●
          </span>
          Em trânsito
        </>
      ),
    },
    {
      value: "Iniciado",
      label: (
        <>
          <span
            style={{ color: "green", fontSize: "25px", marginRight: "8px" }}
          >
            ●
          </span>
          Iniciado
        </>
      ),
    },
    {
      value: "Pendente",
      label: (
        <>
          <span
            style={{ color: "orange", fontSize: "25px", marginRight: "8px" }}
          >
            ●
          </span>
          Pendente
        </>
      ),
    },
  ];

  const openAddressForm = () => {
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    const storedRoutes = JSON.parse(localStorage.getItem("selectedRoutes")) || {
      routes: [],
    };
    setSavedRoutes(storedRoutes.routes);
    setIsAddressFormOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const storedRoutes = JSON.parse(localStorage.getItem("selectedRoutes")) || {
      routes: [],
    };
    setSavedRoutes(storedRoutes.routes);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Resetar para a primeira página ao aplicar filtros
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredRoutes.map((route) => ({
      Motorista: route.driver,
      "Raio(KM)": route.radius,
      "Início(Data e Hora)": formatDateTime(route.startTime),
      "Expectativa De Inicio": formatDateTime(route.startTimeExpected),
      "Fim(Data e Hora)": formatDateTime(route.endTime),
      "Expectativa De Chegada": formatDateTime(route.endTimeExpected),
      Status: getStatusLabelText(route.status), // Usa a função para formatar com bolinhas
      Veículo: route.vehicle,
      "Cidade De Início": route.startCity || "N/A",
      "Cidade Final": route.endCity || "N/A",
      "Destinos Adicionais": route.additionalDestinations
        ? route.additionalDestinations.join(", ")
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Routes");
    XLSX.writeFile(wb, "routes.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("portrait");
    doc.setFillColor("white");
    doc.rect(
      0,
      0,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height,
      "F"
    );

    const logoBase64 = base64String;

    doc.setGState(new doc.GState({ opacity: 0.2 }));
    doc.addImage(logoBase64, "PNG", 30, 20, 150, 120);

    doc.setGState(new doc.GState({ opacity: 1 }));
    autoTable(doc, {
      margin: { top: 10, right: 5, bottom: 10, left: 5 },
      head: [
        [
          "Motorista",
          "Raio(KM)",
          "Início(Data e Hora)",
          "Expectativa De Inicio",
          "Fim(Data e Hora)",
          "Expectativa De Chegada",
          "Status",
          "Veículo",
          "Cidade De Início",
          "Cidade Final",
          "Destinos Adicionais",
        ],
      ],
      body: filteredRoutes.map((route) => [
        route.driver,
        route.radius,
        formatDateTime(route.startTime),
        formatDateTime(route.startTimeExpected),
        formatDateTime(route.endTime),
        formatDateTime(route.endTimeExpected),
        route.status,
        route.vehicle,
        route.startCity || "N/A",
        route.endCity || "N/A",
        route.additionalDestinations
          ? route.additionalDestinations.join(", ")
          : "N/A",
      ]),
      theme: "grid",
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 1,
        textColor: 0,
        fillColor: null,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: ["#091f33"],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 16 },
        2: { cellWidth: 16 },
        3: { cellWidth: 16 },
        4: { cellWidth: 16 },
        5: { cellWidth: 16 },
        6: { cellWidth: "auto" },
        7: { cellWidth: "auto" },
        8: { cellWidth: "auto" },
        9: { cellWidth: "auto" },
        10: { cellWidth: 20 },
      },
    });

    doc.save("rotas_com_logo.pdf");
  };

  const handleRowClick = (route) => {
    const hasMultipleRoutes = route.routes && route.routes.length > 1;
    if (hasMultipleRoutes) {
      localStorage.setItem(
        "gps",
        JSON.stringify({
          routes: route.routes,
          radius: route.radius,
          driver: route.driver,
        })
      );
    } else {
      localStorage.setItem(
        "gps",
        JSON.stringify({
          coordinates: route.routes[0].coordinates,
          radius: route.radius,
          driver: route.driver,
        })
      );
    }
    router.push("/home/gps");
  };

  const filteredRoutes = savedRoutes.filter((route) => {
    const additionalDestinationsMatch =
      selectedFilters.additionalDestinations === "" ||
      (route.additionalDestinations &&
        route.additionalDestinations
          .join(", ")
          .toLowerCase()
          .includes(selectedFilters.additionalDestinations.toLowerCase()));

    const startTimeMatch =
      selectedFilters.startTime === "" ||
      new Date(route.startTime) >= new Date(selectedFilters.startTime);
    const startTimeExpectedMatch =
      selectedFilters.startTimeExpected === "" ||
      new Date(route.startTimeExpected) >=
        new Date(selectedFilters.startTimeExpected);
    const endTimeMatch =
      selectedFilters.endTime === "" ||
      new Date(route.endTime) <= new Date(selectedFilters.endTime);
    const endTimeExpectedMatch =
      selectedFilters.endTimeExpected === "" ||
      new Date(route.endTimeExpected) <=
        new Date(selectedFilters.endTimeExpected);

    return (
      (selectedFilters.driver === "" ||
        route.driver
          .toLowerCase()
          .includes(selectedFilters.driver.toLowerCase())) &&
      (selectedFilters.radius === "" ||
        route.radius.toString().includes(selectedFilters.radius)) &&
      (selectedFilters.status === "" ||
        route.status
          .toLowerCase()
          .includes(selectedFilters.status.toLowerCase())) &&
      (selectedFilters.vehicle === "" ||
        route.vehicle
          .toLowerCase()
          .includes(selectedFilters.vehicle.toLowerCase())) &&
      (selectedFilters.startCity === "" ||
        (route.startCity &&
          route.startCity
            .toLowerCase()
            .includes(selectedFilters.startCity.toLowerCase()))) &&
      (selectedFilters.endCity === "" ||
        (route.endCity &&
          route.endCity
            .toLowerCase()
            .includes(selectedFilters.endCity.toLowerCase()))) &&
      additionalDestinationsMatch &&
      startTimeMatch &&
      startTimeExpectedMatch &&
      endTimeMatch &&
      endTimeExpectedMatch
    );
  });

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const resetFilters = () => {
    setSelectedFilters({
      driver: "",
      radius: "",
      status: "",
      vehicle: "",
      startTime: "",
      startTimeExpected: "",
      endTime: "",
      endTimeExpected: "",
      startCity: "",
      endCity: "",
      additionalDestinations: "",
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);

  const getUniqueOptions = (key) => {
    return Array.from(
      new Set(savedRoutes.map((route) => route[key]).filter(Boolean))
    );
  };

  const getStatusLabel = (status) => {
    const statusColors = {
      "Em trânsito": "red",
      Iniciado: "green",
      Pendente: "orange",
    };

    return (
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: statusColors[status] || "orange",
          }}
        />
        {status}
      </span>
    );
  };

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.container} ${
          isSidebarOpen
            ? styles["with-sidebar-open"]
            : styles["with-sidebar-closed"]
        }`}
      >
        {/* Botões de ação */}
        <div className={styles.searchContainer}>
          <div className={styles.buttonContainer}>
            <button onClick={openAddressForm} className={styles.openButton}>
              Criar rota
            </button>
            <button onClick={exportToExcel} className={styles.exportButton}>
              Exportar para Excel
            </button>
            <button onClick={exportToPDF} className={styles.exportButton}>
              Exportar para PDF
            </button>
            <button
              onClick={toggleFiltersVisibility}
              className={styles.toggleButton}
            >
              <FaFilter />
              {isFiltersVisible ? "Esconder Filtros" : "Filtrar"}
            </button>
            {/* Botão para abrir a modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.openButton}
            >
              Editar Número de Telefone
            </button>
          </div>
        </div>

        <div>
          {/* <div className={styles.buttonContainer}>
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.openButton}
              style={{
                backgroundColor: "green",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                margin: "10px 0",
              }}
            >
              Editar Números
            </button>
          </div> */}
          {/* Modal para edição e adição de números */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              },
              content: {
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                width: "90%",
                maxWidth: "450px",
                textAlign: "center",
                position: "relative",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              },
            }}
            ariaHideApp={false}
          >
            {/* Cabeçalho da modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <h2
                style={{ margin: "0", fontSize: "1.5rem", fontWeight: "bold" }}
              >
                Editar Números
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsHovered(false); // Resetar para preto ao fechar a modal
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: isHovered ? "red" : "black", // Cor muda apenas no hover
                  transition: "color 0.3s ease-in-out",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Lista de números para edição */}
            <h4
              style={{
                marginTop: "20px",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              Números para Envio:
            </h4>
            <ul style={{ listStyleType: "none", padding: 0, width: "100%" }}>
              {numbers.map((num, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="text"
                    value={num}
                    onChange={(e) => {
                      const updatedNumbers = [...numbers];
                      updatedNumbers[index] = e.target.value;
                      setNumbers(updatedNumbers);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      fontSize: "16px",
                    }}
                  />
                  <button
                    onClick={() => removeNumber(index)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>

            {/* Campo para adicionar novo número */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                width: "100%",
              }}
            >
              <input
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Novo número"
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              />
              <button
                onClick={addNumber}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                +
              </button>
            </div>

            {/* Botão para salvar e fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: "green",
                color: "white",
                border: "none",
                padding: "12px",
                width: "100%",
                marginTop: "15px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Salvar e Fechar
            </button>
          </Modal>
        </div>

        <div>
          {isFiltersVisible && (
            <div className={styles.filterContainer}>
              <div className={styles.filterItem}>
                <label>Motorista:</label>
                <select
                  name="driver"
                  value={selectedFilters.driver}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {getUniqueOptions("driver").map((driver, index) => (
                    <option key={index} value={driver}>
                      {driver}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Raio (KM):</label>
                <select
                  name="radius"
                  value={selectedFilters.radius}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {getUniqueOptions("radius").map((radius, index) => (
                    <option key={index} value={radius}>
                      {radius}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Início (Data):</label>
                <input
                  type="date"
                  name="startTime"
                  value={selectedFilters.startTime}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterItem}>
                <label>Expectativa De Inicio:</label>
                <input
                  type="date"
                  name="startTimeExpected"
                  value={selectedFilters.startTimeExpected}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterItem}>
                <label>Fim (Data):</label>
                <input
                  type="date"
                  name="endTime"
                  value={selectedFilters.endTime}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterItem}>
                <label>Expectativa De Chegada:</label>
                <input
                  type="date"
                  name="endTimeExpected"
                  value={selectedFilters.endTimeExpected}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.filterItem}>
                <label>Status:</label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (option) => option.value === selectedFilters.status
                  )}
                  onChange={(selectedOption) =>
                    handleFilterChange({
                      target: {
                        name: "status",
                        value: selectedOption ? selectedOption.value : "",
                      },
                    })
                  }
                  placeholder="Selecione um status"
                  isClearable={true} // 🔥 Agora permite limpar a seleção
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#ccc",
                      boxShadow: "none",
                      cursor: "pointer", // 🔥 Adiciona cursor de clique
                      "&:hover": { borderColor: "#aaa" },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      display: "flex",
                      alignItems: "center",
                    }),
                    option: (base, state) => ({
                      ...base,
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer", // 🔥 Permite clique nas opções
                      color:
                        state.data.value === "Em trânsito"
                          ? "red"
                          : state.data.value === "Pendente"
                          ? "orange"
                          : state.data.value === "Iniciado"
                          ? "green"
                          : "black",
                    }),
                  }}
                />
              </div>

              <div className={styles.filterItem}>
                <label>Veículo:</label>
                <select
                  name="vehicle"
                  value={selectedFilters.vehicle}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {getUniqueOptions("vehicle").map((vehicle, index) => (
                    <option key={index} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Cidade De Início:</label>
                <select
                  name="startCity"
                  value={selectedFilters.startCity}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {getUniqueOptions("startCity").map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Cidade Final:</label>
                <select
                  name="endCity"
                  value={selectedFilters.endCity}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {getUniqueOptions("endCity").map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterItem}>
                <label>Destinos Adicionais:</label>
                <input
                  type="text"
                  name="additionalDestinations"
                  placeholder="Buscar destinos..."
                  value={selectedFilters.additionalDestinations}
                  onChange={handleFilterChange}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button onClick={resetFilters} className={styles.resetButton}>
                  Resetar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
        <Modal
          isOpen={isAddressFormOpen}
          onRequestClose={closeAddressForm}
          className={styles.content}
          overlayClassName={styles.overlay}
          ariaHideApp={false}
        >
          <div className={styles.modalContent}>
            <AddressForm />
          </div>
          <div className={styles.footer}>
            <button className={styles.button} onClick={closeAddressForm}>
              Fechar
            </button>
          </div>
        </Modal>

        {filteredRoutes.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Raio(KM)</th>
                  <th>Início (Data e Hora)</th>
                  <th>Expectativa De Inicio</th>
                  <th>Fim (Data e Hora)</th>
                  <th>Expectativa De Chegada</th>
                  <th>Status</th>
                  <th>Veículo</th>
                  <th>Cidade De Início</th>
                  <th>Cidade Final</th>
                  <th>Destinos Adicionais</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((route, index) => {
                  const finalCity =
                    route.endCity ||
                    (route.additionalDestinations &&
                      route.additionalDestinations[0]) ||
                    "N/A";
                  const additionalDestinations = route.endCity
                    ? route.additionalDestinations || []
                    : (route.additionalDestinations || []).slice(1);

                  return (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(route)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{route.driver}</td>
                      <td>{route.radius}</td>
                      <td>{formatDateTime(route.startTime)}</td>
                      <td>{formatDateTime(route.startTimeExpected)}</td>
                      <td>{formatDateTime(route.endTime)}</td>
                      <td>{formatDateTime(route.endTimeExpected)}</td>
                      <td>{getStatusLabel(route.status)}</td>
                      <td>{route.vehicle}</td>
                      <td>{route.startCity || "N/A"}</td>
                      <td>{finalCity}</td>
                      <td>
                        {additionalDestinations.length > 0 ? (
                          <ul>
                            {additionalDestinations.map((dest, idx) => (
                              <li key={idx}>{dest}</li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                <FaArrowLeft />
              </button>
              <span className={styles.pageIndicator}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                <FaArrowRight />
              </button>
            </div>
          </>
        ) : (
          <p className={styles.center}>Nenhum Dado Encontrado</p>
        )}
      </div>
    </>
  );
}
