"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import Loading from "@/components/load/loading";
import Sidebar from "@/components/sidebar";
import styles from "./styles.module.css";
import { FaTimes } from "react-icons/fa";

const MapView = () => {
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [leaflet, setLeaflet] = useState(null);
  const [mapComponents, setMapComponents] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInsideFence, setIsInsideFence] = useState(false);
  const [staticLocation, setStaticLocation] = useState([-29.6925, -51.3177]);
  const [latitude, setLatitude] = useState(staticLocation[0]);
  const [longitude, setLongitude] = useState(staticLocation[1]);
  const [isEditing, setIsEditing] = useState(false);
  const [lastAlertSent, setLastAlertSent] = useState(false);

  // const API_ALERT_URL = "/api/send-alert"; // URL da API para envio de alerta

  // Função para criar o polígono do raio ao redor da rota
  const createFencePolygon = (coords, bufferDistance) => {
    if (!coords || coords.length < 2) return null;
    const lineCoords = coords.map(([lat, lon]) => [lon, lat]);
    const line = turf.lineString(lineCoords);
    const buffered = turf.buffer(line, bufferDistance || 1, {
      units: "kilometers",
    });
    return buffered.geometry.coordinates[0];
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        const [L, reactLeaflet] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);
        setLeaflet(L);
        setMapComponents(reactLeaflet);
      }
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    const routeData = localStorage.getItem("gps");
    if (routeData) {
      const parsedData = JSON.parse(routeData);
      setSavedRoutes(parsedData.routes || [parsedData]);
    }
  }, []);

  useEffect(() => {
    if (savedRoutes.length > 0) {
      let isMarkerInside = false;

      // Verifica se o marcador está dentro de qualquer rota
      savedRoutes.forEach((route) => {
        const polygonCoords = createFencePolygon(
          route.coordinates,
          route.radius
        );

        if (polygonCoords) {
          const point = turf.point([staticLocation[1], staticLocation[0]]);
          const polygon = turf.polygon([polygonCoords]);

          if (turf.booleanPointInPolygon(point, polygon)) {
            isMarkerInside = true;
          }
        }
      });

      setIsInsideFence(isMarkerInside);

      // Se o marcador está fora e ainda não enviou alerta, envia
      if (!isMarkerInside && !lastAlertSent) {
        sendAlert();
        setLastAlertSent(true);
      } else if (isMarkerInside) {
        setLastAlertSent(false); // Reseta para permitir envio novamente
      }
    }
  }, [savedRoutes, staticLocation]);

  const sendAlert = async () => {
    try {
      const payload = {
        number: "5551998886750", // Número fixo para envio (ajuste se necessário)
        openTicket: "0",
        queueId: "0",
        body: `O marcador está fora do raio de segurança!\nLocalização: Latitude ${staticLocation[0]}, Longitude ${staticLocation[1]}`,
      };
  
      const response = await axios.post("https://atendimentoapi4.wichat.com.br/api/messages/send", payload);
  
      console.log("Alerta enviado com sucesso!", response.data);
    } catch (error) {
      console.error("Erro ao enviar alerta:", error.response?.data || error.message);
    }
  };

  if (!leaflet || !mapComponents || savedRoutes.length === 0) {
    return <Loading />;
  }

  const { MapContainer, TileLayer, Polyline, Polygon, Marker, Tooltip } =
    mapComponents;

  const markerIcon = leaflet.icon({
    iconUrl: isInsideFence
      ? "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
      : "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
  };

  const handleLongitudeChange = (e) => {
    setLongitude(e.target.value);
  };

  const handleSaveLocation = () => {
    const newLocation = [parseFloat(latitude), parseFloat(longitude)];
    setStaticLocation(newLocation);
    localStorage.setItem("markerLocation", JSON.stringify(newLocation));
    setIsEditing(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
        <h2 style={{ color: "white" }}>Visualização das Rotas</h2>

        <MapContainer
          center={staticLocation}
          zoom={6}
          style={{ height: "80vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {savedRoutes.map((route, index) => (
            <React.Fragment key={index}>
              <Polyline
                positions={route.coordinates.map(([lat, lon]) => [lat, lon])}
                color="blue"
              />
              <Polygon
                positions={createFencePolygon(
                  route.coordinates,
                  route.radius
                )?.map(([lon, lat]) => [lat, lon])}
                pathOptions={{ color: "red", fillOpacity: 0.2 }}
              />
            </React.Fragment>
          ))}

          <Marker
            position={staticLocation}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                setLatitude(staticLocation[0]);
                setLongitude(staticLocation[1]);
                setIsEditing(true);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -30]} opacity={1}>
              Clique para editar localização
            </Tooltip>
          </Marker>
        </MapContainer>
      </div>

      {isEditing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "10px", // Para espaçamento em telas menores
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              position: "relative",
              display: "flex",
              flexDirection: "column", // Alinha os filhos verticalmente
              alignItems: "center", // Centraliza horizontalmente os elementos filhos
              gap: "20px", // Espaço entre os inputs
            }}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setIsEditing(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#333",
                transition: "color 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => (e.target.style.color = "red")}
              onMouseLeave={(e) => (e.target.style.color = "#333")}
            >
              <FaTimes />
            </button>

            {/* Título */}
            <h3
              style={{
                fontSize: "1.5rem",
                color: "#333",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              Editar Coordenadas
            </h3>

            {/* Inputs de latitude e longitude */}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "10px", // Espaço entre o label e o input
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column", // Alinha o label e o input verticalmente
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "left",
                }}
              >
                Latitude:
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={handleLatitudeChange}
                  style={{
                    marginTop: "5px",
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "left",
                }}
              >
                Longitude:
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={handleLongitudeChange}
                  style={{
                    marginTop: "5px",
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </label>
            </div>

            {/* Botão Salvar */}
            <button
              onClick={handleSaveLocation}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
                marginTop: "20px",
                width: "100%", // Ocupa toda a largura disponível
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#218838")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#28a745")}
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
