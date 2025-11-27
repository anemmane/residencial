-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: 127.0.0.1    Database: residencial_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `emergencias`
--

DROP TABLE IF EXISTS `emergencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `emergencias` (
  `id_emergencia` int NOT NULL AUTO_INCREMENT,
  `id_residencia` int NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `status` enum('En proceso','Atendida','Cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'En proceso',
  PRIMARY KEY (`id_emergencia`),
  KEY `id_residencia` (`id_residencia`),
  CONSTRAINT `emergencias_ibfk_1` FOREIGN KEY (`id_residencia`) REFERENCES `residencias` (`id_residencia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergencias`
--

LOCK TABLES `emergencias` WRITE;
/*!40000 ALTER TABLE `emergencias` DISABLE KEYS */;
INSERT INTO `emergencias` VALUES (1,1,'Fuga de agua en la calle principal','2025-10-17','En proceso'),(2,1,'Reporte desde curl','2025-11-27','En proceso'),(3,3,'Reporte de mane: apartamento 3 prueba','2025-11-27','En proceso'),(4,3,'Reporte de vecino 5: neuvo reporte desde el vecino 3\n','2025-11-27','En proceso'),(5,3,'Reporte de Emergencia: neuvo registro','2025-11-27','En proceso'),(6,3,'Reporte de manito: nueva emergencia, ahora si','2025-11-27','En proceso');
/*!40000 ALTER TABLE `emergencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `habitantes`
--

DROP TABLE IF EXISTS `habitantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `habitantes` (
  `id_habitante` int NOT NULL AUTO_INCREMENT,
  `id_residencia` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `status` enum('Viviendo','Ausente','Ex-residente') COLLATE utf8mb4_unicode_ci DEFAULT 'Viviendo',
  `usuario` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('usuario','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'usuario',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_habitante`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `id_residencia` (`id_residencia`),
  CONSTRAINT `habitantes_ibfk_1` FOREIGN KEY (`id_residencia`) REFERENCES `residencias` (`id_residencia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habitantes`
--

LOCK TABLES `habitantes` WRITE;
/*!40000 ALTER TABLE `habitantes` DISABLE KEYS */;
INSERT INTO `habitantes` VALUES (1,1,'Carlos López','1980-05-14','Viviendo','usuario1','temporal123','usuario',NULL),(2,1,'María López','1983-07-22','Viviendo','usuario2','temporal123','usuario',NULL),(3,2,'José Ramírez','1975-10-10','Viviendo','usuario3','$2b$10$8dTJecV.esPpqcfp7shbV.oMqT73BOsEaZh0Ai64ndfgWzAgifkgi','usuario',NULL),(4,1,'Administrador','1990-01-01','Viviendo','admin','$2b$10$8dTJecV.esPpqcfp7shbV.oMqT73BOsEaZh0Ai64ndfgWzAgifkgi','admin','admin@residencial.com');
/*!40000 ALTER TABLE `habitantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_mensuales`
--

DROP TABLE IF EXISTS `pagos_mensuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos_mensuales` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_residencia` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_generacion` date NOT NULL,
  `fecha_limite` date DEFAULT NULL,
  `concepto` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estatus` enum('Pendiente','Pagado','Vencido') COLLATE utf8mb4_unicode_ci DEFAULT 'Pendiente',
  `linea_captura` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medio_pago` enum('Efectivo','Transferencia','En línea','Otro','Tarjeta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Efectivo',
  PRIMARY KEY (`id_pago`),
  KEY `id_residencia` (`id_residencia`),
  CONSTRAINT `pagos_mensuales_ibfk_1` FOREIGN KEY (`id_residencia`) REFERENCES `residencias` (`id_residencia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_mensuales`
--

LOCK TABLES `pagos_mensuales` WRITE;
/*!40000 ALTER TABLE `pagos_mensuales` DISABLE KEYS */;
INSERT INTO `pagos_mensuales` VALUES (1,2,800.00,'2025-10-17','2025-10-27','Cuota mantenimiento','Pendiente','LC12345','Efectivo'),(2,2,950.00,'2025-10-17','2025-11-01','Mantenimiento jardín','Pagado','LC12346','Transferencia'),(6,2,750.00,'2025-10-20','2025-10-30','Cuota mantenimiento','Pagado','LC12347','Efectivo'),(7,2,500.00,'2025-10-21','2025-10-31','Limpieza de áreas comunes','Pendiente','LC12348','Transferencia'),(8,2,1200.00,'2025-10-22','2025-11-05','Reparación de alumbrado','Pagado','LC12349','En línea'),(9,2,500.00,'2025-10-24',NULL,'Limpieza de áreas comunes','Pagado','LC1761336009525-2','Otro'),(10,2,500.00,'2025-10-24',NULL,'Limpieza de áreas comunes','Pendiente','LC1761336605270-2','Otro'),(11,2,500.00,'2025-10-24',NULL,'Limpieza de áreas comunes','Pendiente','LC1761336763158-2','Otro'),(12,2,500.00,'2025-11-04',NULL,'Limpieza de áreas comunes','Pendiente','LC1762294754195-2','Otro');
/*!40000 ALTER TABLE `pagos_mensuales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quejas`
--

DROP TABLE IF EXISTS `quejas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quejas` (
  `id_queja` int NOT NULL AUTO_INCREMENT,
  `id_residencia` int NOT NULL,
  `id_habitante` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estatus` enum('Pendiente','En proceso','Resuelta') COLLATE utf8mb4_unicode_ci DEFAULT 'Pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_queja`),
  KEY `fk_queja_residencia` (`id_residencia`),
  KEY `fk_queja_habitante` (`id_habitante`),
  CONSTRAINT `fk_queja_habitante` FOREIGN KEY (`id_habitante`) REFERENCES `habitantes` (`id_habitante`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_queja_residencia` FOREIGN KEY (`id_residencia`) REFERENCES `residencias` (`id_residencia`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quejas`
--

LOCK TABLES `quejas` WRITE;
/*!40000 ALTER TABLE `quejas` DISABLE KEYS */;
INSERT INTO `quejas` VALUES (1,1,2,'La lámpara del pasillo no funciona.','Pendiente','2025-11-04 17:29:35','2025-11-04 17:29:35'),(2,2,NULL,'Ruidos fuertes en la noche.','En proceso','2025-11-04 17:29:35','2025-11-04 17:29:35'),(3,3,1,'Fuga de agua en el jardín común.','Resuelta','2025-11-04 17:29:35','2025-11-04 17:29:35'),(4,2,3,'nueva queja','Pendiente','2025-11-27 21:51:58','2025-11-27 21:51:58');
/*!40000 ALTER TABLE `quejas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `residencias`
--

DROP TABLE IF EXISTS `residencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `residencias` (
  `id_residencia` int NOT NULL AUTO_INCREMENT,
  `nombre_familia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` date NOT NULL,
  PRIMARY KEY (`id_residencia`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `residencias`
--

LOCK TABLES `residencias` WRITE;
/*!40000 ALTER TABLE `residencias` DISABLE KEYS */;
INSERT INTO `residencias` VALUES (1,'Familia López','Calle 1 #45','2025-10-17'),(2,'Familia Ramírez','Calle 2 #67','2025-10-17'),(3,'Familia González','Calle 3 #89','2025-10-17');
/*!40000 ALTER TABLE `residencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votaciones`
--

DROP TABLE IF EXISTS `votaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `votaciones` (
  `id_votacion` int NOT NULL AUTO_INCREMENT,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('Activa','Cerrada') COLLATE utf8mb4_unicode_ci DEFAULT 'Activa',
  PRIMARY KEY (`id_votacion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votaciones`
--

LOCK TABLES `votaciones` WRITE;
/*!40000 ALTER TABLE `votaciones` DISABLE KEYS */;
INSERT INTO `votaciones` VALUES (1,'¿Desea instalar cámaras de seguridad en las áreas comunes?','2025-11-04','2025-11-11','Activa'),(2,'¿Está de acuerdo en cambiar el proveedor de limpieza?','2025-11-04','2025-11-09','Activa'),(3,'¿Aprueba la construcción de una nueva área de juegos?','2025-11-04','2025-11-14','Activa'),(4,'¿Desea cerrar el acceso trasero después de las 9 PM?','2025-11-04','2025-11-07','Cerrada'),(5,'¿Estás de acuerdo en ampliar el horario del gimnasio?','2025-11-04','2025-11-08','Activa'),(6,'¿Debería crearse un comité de seguridad?','2025-11-04','2025-11-09','Activa');
/*!40000 ALTER TABLE `votaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votos`
--

DROP TABLE IF EXISTS `votos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `votos` (
  `id_voto` int NOT NULL AUTO_INCREMENT,
  `id_votacion` int NOT NULL,
  `id_habitante` int NOT NULL,
  `voto` enum('A favor','En contra','Abstención') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_voto`),
  KEY `id_votacion` (`id_votacion`),
  KEY `id_habitante` (`id_habitante`),
  CONSTRAINT `votos_ibfk_1` FOREIGN KEY (`id_votacion`) REFERENCES `votaciones` (`id_votacion`),
  CONSTRAINT `votos_ibfk_2` FOREIGN KEY (`id_habitante`) REFERENCES `habitantes` (`id_habitante`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votos`
--

LOCK TABLES `votos` WRITE;
/*!40000 ALTER TABLE `votos` DISABLE KEYS */;
INSERT INTO `votos` VALUES (1,1,1,'A favor','2025-11-04 17:46:13'),(2,1,2,'En contra','2025-11-04 17:46:13'),(3,2,1,'Abstención','2025-11-04 17:46:13'),(4,3,1,'A favor','2025-11-04 17:46:13'),(5,1,3,'A favor','2025-11-04 18:28:15'),(6,3,3,'A favor','2025-11-04 18:28:19');
/*!40000 ALTER TABLE `votos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27 16:47:08
