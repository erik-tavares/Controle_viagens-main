"use client";
import { FaCamera, FaFileUpload, FaInfoCircle, FaTimes } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getCoordinates, getRoutes } from "./action";
import DynamicMap from "./DynamicMap";
import styles from "./styles.module.css";
import Sidebar from "@/components/sidebar";
import Loading from "@/components/load/loading";
import { Tooltip } from "react-tooltip";
import Select from "react-select";

const AddressForm = () => {
  const [start, setStart] = useState("");
  const [destinations, setDestinations] = useState([""]);
  const [radius, setRadius] = useState(3);
  const [routes, setRoutes] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]); // Para seleção múltipla de segmentos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [vehicle, setVehicle] = useState(""); // Novo estado para veículos
  const [startTimeExpected, setStartTimeExpected] = useState(""); // Novo estado para data e hora de início previsto
  const [endTimeExpected, setEndTimeExpected] = useState(""); // Novo estado para data e hora de fim previsto
  const [startTime, setStartTime] = useState(""); // Novo estado para data e hora de início
  const [endTime, setEndTime] = useState(""); // Novo estado para data e hora de fim
  const [status, setStatus] = useState(""); // Novo estado para status
  const [invoice, setInvoice] = useState(""); // Novo estado para notas fiscais
  const [saveCompleteRoute, setSaveCompleteRoute] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // Estado para exibir tooltip
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const handleInvoiceChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    setInvoice(numericValue);
  };
  const statusOptions = [
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

  const customStyles = (isSidebarOpen) => ({
    content: {
      left: isSidebarOpen ? "calc(25% + 120px)" : "10%",
      width: "100%",
      maxWidth: isSidebarOpen ? "800px" : "1500px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  });

  useEffect(() => {
    const loadDrivers = async () => {
      const driverList = [
        { id: "1", name: "João Silva" },
        { id: "2", name: "Maria Oliveira" },
        { id: "3", name: "Carlos Souza" },
      ];
      setDrivers(driverList);
    };

    loadDrivers();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && document.getElementById("__next")) {
      Modal.setAppElement("#__next");
    }
  }, []);

  const handleAddDestination = () => {
    setDestinations([...destinations, ""]);
  };

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      alert("Por favor, selecione um motorista.");
      return;
    }

    try {
      setLoading(true);
      const allRoutes = [];
      const startCoordinates = await getCoordinates(start);

      let previousCoordinates = startCoordinates;

      for (const destination of destinations) {
        if (destination) {
          const endCoordinates = await getCoordinates(destination);
          const segmentRoutes = await getRoutes(
            previousCoordinates,
            endCoordinates
          );
          allRoutes.push(...segmentRoutes);
          previousCoordinates = endCoordinates;
        }
      }

      setRoutes(allRoutes);
      setSelectedSegments([0]); // Seleciona o primeiro segmento por padrão
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao obter as coordenadas:", error);
      alert(
        "Não foi possível obter as coordenadas ou calcular as rotas. Por favor, verifique os endereços e tente novamente."
      );
    } finally {
      setLoading(false); // Desativa o loading após a operação
    }
  };

  const handleSegmentChange = (index) => {
    setSelectedSegments(
      (prevSelectedSegments) =>
        prevSelectedSegments.includes(index)
          ? prevSelectedSegments.filter((i) => i !== index) // Remove o segmento se já estiver selecionado
          : [...prevSelectedSegments, index] // Adiciona o segmento se não estiver selecionado
    );
  };

  const saveSelectedRoutes = () => {
    if (!routes || routes.length === 0) {
      alert("Nenhuma rota para salvar.");
      return;
    }

    const dataToSave = {
      driver: selectedDriver,
      vehicle,
      startTimeExpected,
      endTimeExpected,
      startTime,
      endTime,
      status: status?.value || "",
      invoice,
      radius,
      startCity: start,
      endCity: destinations[destinations.length - 1],
      additionalDestinations: destinations.slice(0, -1),
      routes: routes.map((route) => ({
        coordinates: route.coordinates,
        duration: route.duration,
      })),
    };

    try {
      const savedRoutes = JSON.parse(
        localStorage.getItem("selectedRoutes")
      ) || {
        routes: [],
      };
      savedRoutes.routes.push(dataToSave);
      localStorage.setItem("selectedRoutes", JSON.stringify(savedRoutes));
      alert("Rota salva com sucesso!");
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      alert("Erro ao salvar rota.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file), // Gera uma URL temporária para pré-visualização
    }));

    setUploadedFiles((prevFiles) => [...prevFiles, ...files]); // Mantém os arquivos anteriores e adiciona novos
  };

  const removeFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      {loading && <Loading message="Carregando..." />}
      {/* <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}
      {/* <div
        className={`${styles.container} ${
          isSidebarOpen ? styles['with-sidebar-open'] : styles['with-sidebar-closed']
        }`}
      > */}
      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className={styles["form-row"]}>
            <label>
              Selecione o Motorista:
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">Selecione um motorista</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Selecione o Veículo:
              <input
                type="text"
                placeholder="Veículo"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Data e Hora de Início Previsto:
              <input
                type="datetime-local"
                value={startTimeExpected}
                onChange={(e) => setStartTimeExpected(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Data e Hora de Fim Previsto:
              <input
                type="datetime-local"
                value={endTimeExpected}
                onChange={(e) => setEndTimeExpected(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Data e Hora de Início:
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Data e Hora de Fim:
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["form-row"]}>
            <label>Status:</label>
            <Select
              options={statusOptions}
              value={status}
              onChange={(selectedOption) => setStatus(selectedOption)}
              placeholder="Selecione um status"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#ccc",
                  boxShadow: "none",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#aaa" },
                }),
                singleValue: (base) => ({
                  ...base,
                  display: "flex",
                  alignItems: "center",
                }),
              }}
            />
          </div>

          <div className={styles["form-row"]} style={{ position: "relative" }}>
            <label>
              <span>Notas Fiscais:</span>
            </label>

            <div
              className={styles.fileInputContainer}
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Botão para tirar foto */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("invoiceCamera").click();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  cursor: "pointer",
                  border: "1px solid #007bff",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "0 2px 5px rgba(0, 123, 255, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
              >
                <FaCamera size={20} /> Tirar Foto
              </button>

              {/* Botão para anexar arquivo */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("invoiceFile").click();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  cursor: "pointer",
                  border: "1px solid #28a745",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.3s ease-in-out",
                  boxShadow: "0 2px 5px rgba(40, 167, 69, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1e7e34")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#28a745")
                }
              >
                <FaFileUpload size={20} /> Anexar Arquivo
              </button>

              {/* Ícone de informação com tooltip */}
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginLeft: "10px",
                  cursor: "default",
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FaInfoCircle
                  size={20}
                  style={{ color: "#333", cursor: "pointer" }}
                />

                {showTooltip && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#333",
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      zIndex: "100",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    Você pode tirar uma foto ou anexar um arquivo como Nota
                    Fiscal.
                  </span>
                )}
              </div>
            </div>

            {/* Input de captura de foto */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="invoiceCamera"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            {/* Input para anexar arquivo */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              id="invoiceFile"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Exibição dos arquivos anexados */}
            <div style={{ marginTop: "15px" }}>
              {uploadedFiles.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        border: "1px solid #ccc",
                        padding: "10px",
                        borderRadius: "6px",
                        backgroundColor: "#f9f9f9",
                        width: "100px",
                        textAlign: "center",
                      }}
                    >
                      {file.file.type.startsWith("image/") ? (
                        <img
                          src={file.preview}
                          alt="Preview"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <FaFileUpload size={40} style={{ color: "#555" }} />
                      )}
                      <span
                        style={{
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "90px",
                        }}
                        title={file.file.name}
                      >
                        {file.file.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Impede o comportamento padrão de envio do formulário
                          e.stopPropagation(); // Impede a propagação do clique para o formulário
                          removeFile(index);
                        }}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "5px",
                          cursor: "pointer",
                          borderRadius: "50%",
                          fontSize: "12px",
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Início:
              <input
                type="text"
                placeholder="Endereço de início"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
          </div>

          {destinations.map((destination, index) => (
            <div className={styles["form-row"]} key={index}>
              <label>
                Destino {index + 1}:
                <input
                  type="text"
                  placeholder={`Endereço de destino ${index + 1}`}
                  value={destination}
                  onChange={(e) =>
                    handleDestinationChange(index, e.target.value)
                  }
                />
              </label>
            </div>
          ))}

          <div className={styles["button-row"]}>
            <button type="button" onClick={handleAddDestination}>
              Adicionar Destino
            </button>
          </div>

          <div className={styles["form-row"]}>
            <label>
              Raio (km):
              <input
                type="number"
                placeholder="Raio em km"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </label>
          </div>

          <div className={styles["button-row"]}>
            <button type="submit">Obter Rotas</button>
          </div>
        </form>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customStyles(isSidebarOpen)}
        ariaHideApp={false}
      >
        <h2 className={styles.titleModal}>Rotas Calculadas</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "20px",
          }}
        >
          <div>
            <div>
              <label className={styles.labelModal}>
                Selecione os Segmentos da Rota:
              </label>
              <div>
                {routes.map((route, index) => (
                  <div key={index} className={styles.inputLabelContainer}>
                    <input
                      type="checkbox"
                      checked={selectedSegments.includes(index)}
                      onChange={() => handleSegmentChange(index)}
                      className={styles.inputModal}
                    />
                    <label className={styles.labelModalRota}>
                      {" "}
                      {`Rota ${index + 1}`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={saveSelectedRoutes}
                className={styles.buttonModal}
              >
                Salvar Rotas
              </button>
              <button onClick={closeModal} className={styles.buttonModalClose}>
                Fechar
              </button>
            </div>
          </div>
          <div
            style={{
              minHeight: "800px",
            }}
          >
            {selectedSegments.length > 0 && (
              <DynamicMap
                allRoutes={selectedSegments.map((index) => routes[index])}
                radius={radius}
              />
            )}
          </div>
        </div>
      </Modal>
      {/* </div> */}
    </>
  );
};

export default AddressForm;
