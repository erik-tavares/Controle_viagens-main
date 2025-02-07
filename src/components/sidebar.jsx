"use client";
import * as React from "react";
import { useState, createContext, useContext } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import RouteIcon from "@mui/icons-material/Route"; // Ícone de rotas
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/assets/img/logo_logaux_v3.png";
import { Tooltip } from "@mui/material";

const ThemeContext = createContext();

const drawerWidth = 255;

// Componente para alternar o tema
// function ThemeToggle() {
//   const { isDarkMode, toggleTheme } = useContext(ThemeContext);

//   return (
//     <IconButton
//       onClick={toggleTheme}
//       sx={{
//         color: isDarkMode ? '#fff' : '#000',
//         transition: 'transform 0.3s ease',
//         transform: isDarkMode ? 'rotate(360deg)' : 'rotate(0deg)',
//       }}
//     >
//       {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
//     </IconButton>
//   );
// }

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        sx={{
          width: isSidebarOpen ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? drawerWidth : 60,
            boxSizing: "border-box",
            overflowX: "hidden",
            background: "#091f33",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: isSidebarOpen ? "flex-start" : "center",
            padding: "10px",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <IconButton
          onClick={toggleSidebar}
          sx={{ marginLeft: isSidebarOpen ? "auto" : "0" }}
        >
          <Tooltip title="Menu" arrow>
            <MenuIcon />
          </Tooltip>
        </IconButton>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarOpen ? "space-between" : "center",
            width: "100%",
            padding: isSidebarOpen ? "0 10px" : "0",
          }}
        >
          {isSidebarOpen && (
            <Image
              src={Logo}
              alt="Daily Control"
              height={60}
              width={220}
              style={{
                marginRight: "auto",
                marginTop: "20px",
                paddingRight: "15px",
              }}
            />
          )}
        </Box>

        {/* Lista de Links */}
        <List sx={{ width: "100%", alignItems: "center" }}>
          <ListItem key="home" disablePadding>
            <Tooltip title="Home" arrow>
              <ListItemButton
                component={Link}
                href="dashboard"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <HomeIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Home" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem key="driver-form" disablePadding>
            <Tooltip title="Motorista" arrow>
              <ListItemButton
                component={Link}
                href="motorista"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <PersonIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Motorista" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem key="vehicle-form" disablePadding>
            <Tooltip title="Veículo" arrow>
              <ListItemButton
                component={Link}
                href="veiculos"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <DirectionsCarIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Veículo" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem key="operation-form" disablePadding>
            <Tooltip title="Operação" arrow>
              <ListItemButton
                component={Link}
                href="operacao"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <AssignmentIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Operação" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Item Rotas */}
          <ListItem key="routes" disablePadding>
            <Tooltip title="Rotas" arrow>
              <ListItemButton
                component={Link}
                href="rotas"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <RouteIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Rotas" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          <ListItem key="gps" disablePadding>
            <Tooltip title="GPS" arrow>
              <ListItemButton
                component={Link}
                href="gps"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <MyLocationIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="GPS" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem key="logout" disablePadding>
            <Tooltip title="Logout" arrow>
              <ListItemButton
                component={Link}
                href="login"
                sx={{
                  justifyContent: "center",
                  paddingLeft: "35px",
                  "&:hover": {
                    backgroundColor: "#004080",
                    borderRadius: "5px",
                    padding: "5px",
                    paddingLeft: "35px",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffff" }}>
                  <LogoutIcon />
                </ListItemIcon>
                {isSidebarOpen && <ListItemText primary="Logout" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}
