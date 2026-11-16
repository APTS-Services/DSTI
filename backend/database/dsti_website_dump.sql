-- =====================================================================
-- DSTI Website — complete database dump (schema + starter content)
-- MySQL 8.x / MariaDB 10.6+   •   utf8mb4
--
-- Import: open this file in MySQL Workbench and run it (or: mysql < this.sql).
-- It creates the dsti_website database, all tables and all seed content,
-- so no separate schema.sql / npm run seed step is needed.
--
-- CMS sign-in after import:  username: admin   password: Dsti@2026#Init
-- (you must set a new password at the first sign-in).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `dsti_website`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dsti_website`;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `almanac_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `almanac_entries` (
  `entry_id` int unsigned NOT NULL AUTO_INCREMENT,
  `entry_type` enum('science_day','observance','this_day') COLLATE utf8mb4_unicode_ci NOT NULL,
  `month_no` tinyint unsigned NOT NULL,
  `day_no` tinyint unsigned NOT NULL,
  `event_year` smallint DEFAULT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`entry_id`),
  KEY `idx_almanac_date` (`month_no`,`day_no`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `almanac_entries` WRITE;
/*!40000 ALTER TABLE `almanac_entries` DISABLE KEYS */;
INSERT INTO `almanac_entries` (`entry_id`, `entry_type`, `month_no`, `day_no`, `event_year`, `title_en`, `title_te`, `description_en`, `description_te`) VALUES (1,'science_day',2,28,NULL,'National Science Day','జాతీయ విజ్ఞాన దినోత్సవం',NULL,NULL),(2,'science_day',5,11,NULL,'National Technology Day','జాతీయ సాంకేతిక దినోత్సవం',NULL,NULL),(3,'science_day',8,23,NULL,'National Space Day','జాతీయ అంతరిక్ష దినోత్సవం',NULL,NULL),(4,'science_day',11,10,NULL,'World Science Day for Peace and Development','శాంతి మరియు అభివృద్ధి కోసం ప్రపంచ విజ్ఞాన దినోత్సవం',NULL,NULL);
/*!40000 ALTER TABLE `almanac_entries` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `assistant_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistant_feedback` (
  `log_id` bigint unsigned NOT NULL,
  `helpful` tinyint(1) NOT NULL,
  `comment` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `assistant_feedback_ibfk_1` FOREIGN KEY (`log_id`) REFERENCES `assistant_logs` (`log_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `assistant_feedback` WRITE;
/*!40000 ALTER TABLE `assistant_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `assistant_feedback` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `assistant_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistant_logs` (
  `log_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `source_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lang` enum('en','te') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `was_answered` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `assistant_logs` WRITE;
/*!40000 ALTER TABLE `assistant_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `assistant_logs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `audience_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audience_cards` (
  `card_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `audience` enum('citizen','student','researcher','investor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_te` varchar(400) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `audience` (`audience`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `audience_cards` WRITE;
/*!40000 ALTER TABLE `audience_cards` DISABLE KEYS */;
INSERT INTO `audience_cards` (`card_id`, `audience`, `title_en`, `title_te`, `description_en`, `description_te`, `link_url`, `display_order`) VALUES (1,'citizen','Citizens','పౌరులు','Find information about the Department, its organisations, official announcements, public documents and ways to contact the Department.','శాఖ, దాని సంస్థలు, అధికారిక ప్రకటనలు, ప్రభుత్వ పత్రాలు మరియు శాఖను సంప్రదించే విధానాలకు సంబంధించిన సమాచారాన్ని పొందండి.',NULL,10),(2,'student','Students','విద్యార్థులు','Explore science and technology activities, science outreach programmes, events and opportunities announced by the Department and its confirmed organisations.','శాఖ మరియు దాని ధృవీకరించబడిన సంస్థలు ప్రకటించే విజ్ఞాన శాస్త్ర, సాంకేతిక కార్యక్రమాలు, విజ్ఞాన ప్రచార కార్యక్రమాలు, సమావేశాలు మరియు అవకాశాల వివర్లను తెలుసుకోండి.',NULL,20),(3,'researcher','Researchers','పరిశోధకులు','Access information about research institutions, science and technology initiatives, collaboration opportunities and notified research-related programmes.','పరిశోధనా సంస్థలు, విజ్ఞాన శాస్త్ర మరియు సాంకేతిక కార్యక్రమాలు, పరిశోధనా సహకార అవకాశాలు మరియు ప్రకటించబడిన పరిశోధన సంబంధిత కార్యక్రమాల వివర్లను పొందండి.',NULL,30),(4,'investor','Investors','పెట్టుబడిదారులు','Explore the State’s science, technology and innovation priorities, institutional ecosystem, policy information and official investment facilitation contacts.','రాష్ట్ర విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల ప్రాధాన్యతలు, సంస్థాగత వ్యవస్థ, విధానాల సమాచారం మరియు అధికారిక పెట్టుబడి సహాయ సంప్రదింపు వివర్లను తెలుసుకోండి.',NULL,40);
/*!40000 ALTER TABLE `audience_cards` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` int unsigned DEFAULT NULL,
  `target` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_user` (`user_id`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `awards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `awards` (
  `award_id` int unsigned NOT NULL AUTO_INCREMENT,
  `award_year` smallint NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  `image_id` int unsigned DEFAULT NULL,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`award_id`),
  KEY `idx_award_year` (`award_year`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `awards_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `awards` WRITE;
/*!40000 ALTER TABLE `awards` DISABLE KEYS */;
/*!40000 ALTER TABLE `awards` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `backup_id` int unsigned NOT NULL AUTO_INCREMENT,
  `file_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` int unsigned NOT NULL DEFAULT '0',
  `created_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`backup_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `banner_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_en` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_te` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_id` int unsigned DEFAULT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`banner_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `banners_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` (`banner_id`, `title_en`, `title_te`, `message_en`, `message_te`, `image_id`, `link_url`, `display_order`, `is_active`) VALUES (1,'Advancing Science, Technology & Innovation','విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల అభివృద్ధి','Building a knowledge-driven and innovation-led Andhra Pradesh through research, technology and collaboration.','పరిశోధన, సాంకేతికత మరియు భాగస్వామ్యాల ద్వారా విజ్ఞాన ఆధారిత, ఆవిష్కరణలతో కూడిన ఆంధ్రప్రదేశ్ నిర్మాణం.',NULL,'/about',10,1),(2,'Strengthening Research & Development','పరిశోధన మరియు అభివృద్ధికి బలోపేతం','Encouraging scientific research, institutional partnerships and solutions to developmental challenges.','శాస్త్రీయ పరిశోధన, సంస్థాగత భాగస్వామ్యాలు మరియు అభివృద్ధి సవాళ్లకు పరిష్కారాలను ప్రోత్సహించడం.',NULL,'/ict/projects',20,1),(3,'Enabling the Technologies of Tomorrow','భవిష్యత్తు సాంకేతికతలకు నేటి ప్రోత్సాహం','Promoting opportunities in AI, quantum technologies, space, semiconductors and other emerging fields.','కృత్రిమ మేధస్సు, క్వాంటం సాంకేతికతలు, అంతరిక్షం, సెమీకండక్టర్లు మరియు ఇతర అభివృద్ధి చెందుతున్న రంగాలలో అవకాశాల ప్రోత్సాహం.',NULL,'/about',30,1),(4,'Connecting Ideas with Innovation','ఆలోచనలను ఆవిష్కరణలతో అనుసంధానం','Supporting collaboration among government, research institutions, academia, industry and innovators.','ప్రభుత్వం, పరిశోధనా సంస్థలు, విద్యాసంస్థలు, పరిశ్రమలు మరియు ఆవిష్కర్తల మధ్య సహకారాన్ని ప్రోత్సహించడం.',NULL,'/organisations',40,1);
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cms_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_blocks` (
  `block_id` int unsigned NOT NULL AUTO_INCREMENT,
  `collection` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`block_id`),
  UNIQUE KEY `uq_block_key` (`collection`,`item_key`),
  KEY `idx_block_order` (`collection`,`status`,`sort_order`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `cms_blocks_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `cms_blocks_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cms_blocks` WRITE;
/*!40000 ALTER TABLE `cms_blocks` DISABLE KEYS */;
INSERT INTO `cms_blocks` (`block_id`, `collection`, `item_key`, `data`, `status`, `sort_order`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES (1,'navigation','about','{\"label\":{\"en\":\"About the Department\",\"te\":\"శాఖ పరిచయం\"},\"to\":\"/about\",\"blurb\":{\"en\":\"Who we are, our leadership and what we stand for.\",\"te\":\"మేము ఎవరం, మా నాయకత్వం మరియు మా లక్ష్యాలు.\"},\"children\":[{\"label\":{\"en\":\"Introduction\",\"te\":\"పరిచయం\"},\"to\":\"/about\",\"desc\":{\"en\":\"The Department at a glance\",\"te\":\"శాఖ సంక్షిప్తంగా\"}},{\"label\":{\"en\":\"Leadership\",\"te\":\"నాయకత్వం\"},\"to\":\"/about/leadership\",\"desc\":{\"en\":\"Chief Minister, Minister and officers\",\"te\":\"ముఖ్యమంత్రి, మంత్రి మరియు అధికారులు\"}},{\"label\":{\"en\":\"Vision & Mission\",\"te\":\"దృష్టి & లక్ష్యం\"},\"to\":\"/about/mission\",\"desc\":{\"en\":\"Where we are headed\",\"te\":\"మా గమ్యం\"}},{\"label\":{\"en\":\"Objectives\",\"te\":\"లక్ష్యాలు\"},\"to\":\"/about/objectives\",\"desc\":{\"en\":\"What we set out to achieve\",\"te\":\"మేము సాధించదలచినవి\"}},{\"label\":{\"en\":\"Organisation Structure\",\"te\":\"సంస్థ నిర్మాణం\"},\"to\":\"/about/organisation\",\"desc\":{\"en\":\"How the Department is organised\",\"te\":\"శాఖ నిర్మాణం\"}},{\"label\":{\"en\":\"Awards\",\"te\":\"అవార్డులు\"},\"to\":\"/about/awards\",\"desc\":{\"en\":\"Recognition, year by year\",\"te\":\"సంవత్సరం వారీ గుర్తింపు\"}}]}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(2,'navigation','work','{\"label\":{\"en\":\"Our Work\",\"te\":\"మా పని\"},\"to\":\"/organisations\",\"blurb\":{\"en\":\"Organisations, programmes and projects under the Department.\",\"te\":\"శాఖ పరిధిలోని సంస్థలు, కార్యక్రమాలు మరియు ప్రాజెక్టులు.\"},\"children\":[{\"label\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"to\":\"/organisations\",\"desc\":{\"en\":\"Bodies under the Department\",\"te\":\"శాఖ పరిధిలోని సంస్థలు\"}},{\"label\":{\"en\":\"e-Governance\",\"te\":\"ఇ-గవర్నెన్స్\"},\"to\":\"/ict\",\"desc\":{\"en\":\"Digital services status\",\"te\":\"డిజిటల్ సేవల స్థితి\"}},{\"label\":{\"en\":\"Projects & Initiatives\",\"te\":\"ప్రాజెక్టులు & కార్యక్రమాలు\"},\"to\":\"/ict/projects\",\"desc\":{\"en\":\"Programmes, e-Governance and projects\",\"te\":\"కార్యక్రమాలు, ఇ-గవర్నెన్స్ మరియు ప్రాజెక్టులు\"}},{\"label\":{\"en\":\"District Explorer\",\"te\":\"జిల్లా అన్వేషకుడు\"},\"to\":\"/districts\",\"desc\":{\"en\":\"Science & technology in every district\",\"te\":\"ప్రతి జిల్లాలో విజ్ఞానం & సాంకేతికత\"}},{\"label\":{\"en\":\"How it all connects\",\"te\":\"అన్నీ ఎలా అనుసంధానమవుతాయి\"},\"to\":\"/how-it-connects\",\"desc\":{\"en\":\"Policies, sectors and organisations\",\"te\":\"విధానాలు, రంగాలు, సంస్థలు\"}}]}','published',20,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(3,'navigation','policies','{\"label\":{\"en\":\"Policies\",\"te\":\"విధానాలు\"},\"to\":\"/policies\",\"blurb\":{\"en\":\"Policies, Government Orders and support for investors.\",\"te\":\"విధానాలు, ప్రభుత్వ ఉత్తర్వులు మరియు పెట్టుబడిదారులకు మద్దతు.\"},\"children\":[{\"label\":{\"en\":\"All Policies\",\"te\":\"అన్ని విధానాలు\"},\"to\":\"/policies\",\"desc\":{\"en\":\"Notified policies and the STI Policy\",\"te\":\"నోటిఫై చేసిన విధానాలు మరియు STI విధానం\"}},{\"label\":{\"en\":\"Government Orders\",\"te\":\"ప్రభుత్వ ఉత్తర్వులు\"},\"to\":\"/ecitizen/government-orders\",\"desc\":{\"en\":\"Orders issued by the Department\",\"te\":\"శాఖ జారీ చేసిన ఉత్తర్వులు\"}},{\"label\":{\"en\":\"Investor\'s Corner\",\"te\":\"పెట్టుబడిదారుల విభాగం\"},\"to\":\"/investors\",\"desc\":{\"en\":\"Why and how to invest\",\"te\":\"ఎందుకు, ఎలా పెట్టుబడి పెట్టాలి\"}}]}','published',30,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(4,'navigation','citizen','{\"label\":{\"en\":\"Citizen Services\",\"te\":\"పౌర సేవలు\"},\"to\":\"/ecitizen\",\"blurb\":{\"en\":\"Orders, tenders, RTI and documents citizens need.\",\"te\":\"ఉత్తర్వులు, టెండర్లు, సమాచార హక్కు మరియు పౌరులకు అవసరమైన పత్రాలు.\"},\"children\":[{\"label\":{\"en\":\"Tenders\",\"te\":\"టెండర్లు\"},\"to\":\"/tenders\",\"desc\":{\"en\":\"Open and closed tenders\",\"te\":\"తెరిచిన మరియు మూసిన టెండర్లు\"}},{\"label\":{\"en\":\"Government Orders\",\"te\":\"ప్రభుత్వ ఉత్తర్వులు\"},\"to\":\"/ecitizen/government-orders\"},{\"label\":{\"en\":\"Notifications & Circulars\",\"te\":\"నోటిఫికేషన్లు & సర్క్యులర్లు\"},\"to\":\"/ecitizen/notifications\"},{\"label\":{\"en\":\"Acts & Rules\",\"te\":\"చట్టాలు & నియమాలు\"},\"to\":\"/ecitizen/acts\"},{\"label\":{\"en\":\"Guidelines\",\"te\":\"మార్గదర్శకాలు\"},\"to\":\"/ecitizen/guidelines\"},{\"label\":{\"en\":\"Right to Information\",\"te\":\"సమాచార హక్కు\"},\"to\":\"/ecitizen/rti\"},{\"label\":{\"en\":\"IT Act 2000\",\"te\":\"IT చట్టం 2000\"},\"to\":\"/ecitizen/it-act-2000\"},{\"label\":{\"en\":\"PoSH Act\",\"te\":\"PoSH చట్టం\"},\"to\":\"/ecitizen/posh-act\"},{\"label\":{\"en\":\"FAQs\",\"te\":\"తరచుగా అడిగే ప్రశ్నలు\"},\"to\":\"/ecitizen/faqs\"},{\"label\":{\"en\":\"Useful Links\",\"te\":\"ఉపయోగకరమైన లింకులు\"},\"to\":\"/ecitizen/useful-links\"}]}','published',40,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(5,'navigation','media','{\"label\":{\"en\":\"Media\",\"te\":\"మీడియా\"},\"to\":\"/media\",\"blurb\":{\"en\":\"Photos, videos and events.\",\"te\":\"ఫోటోలు, వీడియోలు మరియు కార్యక్రమాలు.\"},\"children\":[{\"label\":{\"en\":\"Photo Gallery\",\"te\":\"ఫోటో గ్యాలరీ\"},\"to\":\"/media/gallery\",\"desc\":{\"en\":\"Moments from across the State\",\"te\":\"రాష్ట్రవ్యాప్త క్షణాలు\"}},{\"label\":{\"en\":\"Science Stories\",\"te\":\"విజ్ఞాన కథలు\"},\"to\":\"/media/science-stories\",\"desc\":{\"en\":\"Short science videos\",\"te\":\"చిన్న విజ్ఞాన వీడియోలు\"}},{\"label\":{\"en\":\"Events\",\"te\":\"కార్యక్రమాలు\"},\"to\":\"/media/events\",\"desc\":{\"en\":\"Upcoming and past events\",\"te\":\"రాబోయే మరియు గత కార్యక్రమాలు\"}}]}','published',50,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(6,'navigation','contact','{\"label\":{\"en\":\"Contact\",\"te\":\"సంప్రదించండి\"},\"to\":\"/contact\",\"blurb\":{\"en\":\"Reach the Department and track your feedback.\",\"te\":\"శాఖను సంప్రదించండి, మీ అభిప్రాయాన్ని ట్రాక్ చేయండి.\"},\"children\":[{\"label\":{\"en\":\"Contact Us\",\"te\":\"సంప్రదించండి\"},\"to\":\"/contact\",\"desc\":{\"en\":\"Address, phone and e-mail\",\"te\":\"చిరునామా, ఫోన్, ఇ-మెయిల్\"}},{\"label\":{\"en\":\"Feedback & Dashboard\",\"te\":\"అభిప్రాయం & సారాంశం\"},\"to\":\"/feedback\",\"desc\":{\"en\":\"Send feedback, track the reply\",\"te\":\"అభిప్రాయం పంపండి, సమాధానం ట్రాక్ చేయండి\"}},{\"label\":{\"en\":\"List of Officers\",\"te\":\"అధికారుల జాబితా\"},\"to\":\"/contact#officers\",\"desc\":{\"en\":\"Who to contact\",\"te\":\"ఎవరిని సంప్రదించాలి\"}}]}','published',60,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(7,'services','services-1','{\"icon\":\"Building2\",\"tone\":\"lavender\",\"to\":\"/organisations\",\"title\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"text\":{\"en\":\"Explore the officially confirmed science, technology and innovation organisations associated with the Department.\",\"te\":\"శాఖతో అనుబంధంగా అధికారికంగా ధృవీకరించబడిన విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల సంస్థల వివర్లను తెలుసుకోండి.\"}}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(8,'services','services-2','{\"icon\":\"ScrollText\",\"tone\":\"sky\",\"to\":\"/policies\",\"title\":{\"en\":\"Policies\",\"te\":\"విధానాలు\"},\"text\":{\"en\":\"Access notified policies and Government orders relating to science, technology and innovation.\",\"te\":\"విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన ఆమోదించబడిన విధానాలు మరియు ప్రభుత్వ ఉత్తర్వులను చూడండి.\"}}','published',20,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(9,'services','services-3','{\"icon\":\"CalendarDays\",\"tone\":\"blush\",\"to\":\"/media/events\",\"title\":{\"en\":\"Events\",\"te\":\"కార్యక్రమాలు\"},\"text\":{\"en\":\"View departmental events, science programmes, conclaves and official announcements.\",\"te\":\"శాఖ కార్యక్రమాలు, విజ్ఞాన కార్యక్రమాలు, సదస్సులు మరియు అధికారిక ప్రకటనల వివర్లను చూడండి.\"}}','published',30,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(10,'services','services-4','{\"icon\":\"MapPinned\",\"tone\":\"mint\",\"to\":\"/districts\",\"title\":{\"en\":\"District Explorer\",\"te\":\"జిల్లా అన్వేషకుడు\"},\"text\":{\"en\":\"Discover science and technology institutions and verified departmental activities across Andhra Pradesh.\",\"te\":\"ఆంధ్రప్రదేశ్ జిల్లాల వారీగా విజ్ఞాన శాస్త్ర, సాంకేతిక సంస్థలు మరియు ధృవీకరించబడిన శాఖ కార్యకలాపాలను తెలుసుకోండి.\"}}','published',40,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(11,'egov','egov-status','{\"name\":{\"en\":\"e-Governance services\",\"te\":\"ఇ-గవర్నెన్స్ సేవలు\"},\"summary\":{\"en\":\"At present, the Department of Science, Technology & Innovation does not operate any standalone citizen-facing e-Governance services, online application systems or mobile applications. Information regarding digital services, if introduced by the Department or its officially confirmed organisations, will be published on this website after they become operational.\",\"te\":\"ప్రస్తుతం విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఎటువంటి ప్రత్యేక పౌర-కేంద్రిత ఇ-గవర్నెన్స్ సేవలు, ఆన్‌లైన్ దరఖాస్తు వ్యవస్థలు లేదా మొబైల్ అనువర్తనాలను నిర్వహించడం లేదు. శాఖ లేదా దాని అధికారికంగా ధృవీకరించబడిన సంస్థలు డిజిటల్ సేవలను ప్రారంభిస్తే, అవి అమలులోకి వచ్చిన తర్వాత ఈ వెబ్‌సైట్‌లో ప్రచురించబడతాయి.\"},\"status\":\"\",\"tags\":[]}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(12,'projects','ap-first','{\"name\":{\"en\":\"AP-FIRST – Andhra Pradesh Future Innovation, Research, Science & Technology\",\"te\":\"AP-FIRST – ఆంధ్రప్రదేశ్ ఫ్యూచర్ ఇన్నోవేషన్, రీసెర్చ్, సైన్స్ & టెక్నాలజీ\"},\"sector\":\"Research, Science, Technology & Innovation\",\"summary\":{\"en\":\"AP-FIRST was established by the Government of Andhra Pradesh through G.O.Ms.No.27, Environment & Forests (SEC.V) Department, dated 29.06.2026, as a Section 8 company to promote research, innovation and technology commercialisation in the State. It focuses on nine priority domains, including aerospace and defence, space technologies, artificial intelligence and cyber security, semiconductors, quantum technologies, healthcare and biotechnology, renewable energy, rural and agricultural technologies, and advanced materials. Administrative control was subsequently transferred to DST&I through G.O.Ms.No.192, General Administration (Cabinet-II) Department, dated 17.09.2026.\",\"te\":\"రాష్ట్రంలో పరిశోధన, ఆవిష్కరణలు మరియు సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించేందుకు ప్రభుత్వం G.O.Ms.No.27, Environment & Forests (SEC.V) Department, తేదీ 29.06.2026 ద్వారా AP-FIRSTను సెక్షన్-8 కంపెనీగా ఏర్పాటు చేసింది. ఏరోస్పేస్ మరియు రక్షణ, అంతరిక్ష సాంకేతికతలు, కృత్రిమ మేధస్సు మరియు సైబర్ భద్రత, సెమీకండక్టర్లు, క్వాంటం సాంకేతికతలు, ఆరోగ్య సంరక్షణ మరియు బయోటెక్నాలజీ, పునరుత్పాదక ఇంధనం, గ్రామీణ మరియు వ్యవసాయ సాంకేతికతలు, అధునాతన పదార్థాలు వంటి తొమ్మిది ప్రాధాన్య రంగాలపై ఈ కార్యక్రమం కృషి చేస్తుంది. G.O.Ms.No.192, General Administration (Cabinet-II) Department, తేదీ 17.09.2026 ద్వారా దీని పరిపాలనా నియంత్రణ DST&I శాఖకు బదిలీ చేయబడింది.\"},\"status\":\"\",\"progress\":null}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(13,'regions','north-coastal','{\"name\":{\"en\":\"North Coastal Andhra\",\"te\":\"ఉత్తర తీరాంధ్ర\"},\"color\":\"#4a2bc2\"}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(14,'regions','godavari','{\"name\":{\"en\":\"Godavari Region\",\"te\":\"గోదావరి ప్రాంతం\"},\"color\":\"#8e55b3\"}','published',20,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(15,'regions','krishna','{\"name\":{\"en\":\"Krishna Region\",\"te\":\"కృష్ణా ప్రాంతం\"},\"color\":\"#1157ce\"}','published',30,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(16,'regions','south-coastal','{\"name\":{\"en\":\"South Coastal Andhra\",\"te\":\"దక్షిణ తీరాంధ్ర\"},\"color\":\"#08979c\"}','published',40,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(17,'regions','rayalaseema','{\"name\":{\"en\":\"Rayalaseema\",\"te\":\"రాయలసీమ\"},\"color\":\"#a46800\"}','published',50,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(18,'leaders','chief-minister','{\"name\":{\"en\":\"Sri Nara Chandrababu Naidu\",\"te\":\"శ్రీ నారా చంద్రబాబు నాయుడు\"},\"designation\":{\"en\":\"Hon’ble Chief Minister of Andhra Pradesh\",\"te\":\"గౌరవనీయులైన ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి\"},\"portfolio\":{\"en\":\"Government of Andhra Pradesh\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వం\"},\"photo\":\"/images/leaders/CM.jpeg\",\"message\":{\"en\":\"\",\"te\":\"\"},\"showOnHome\":true}','published',10,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(19,'leaders','minister','{\"name\":{\"en\":\"Sri Konidala Pawan Kalyan\",\"te\":\"శ్రీ కొణిదెల పవన్ కల్యాణ్\"},\"designation\":{\"en\":\"Hon’ble Minister for Science & Technology\",\"te\":\"గౌరవనీయులైన విజ్ఞాన శాస్త్రం & సాంకేతికత మంత్రి\"},\"portfolio\":{\"en\":\"Deputy Chief Minister and Minister for Environment, Forests, Science & Technology, Panchayat Raj, Rural Development & Rural Water Supply, Government of Andhra Pradesh.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ ఉప ముఖ్యమంత్రి మరియు పర్యావరణం, అటవీ, విజ్ఞాన శాస్త్రం & సాంకేతికత, పంచాయతీరాజ్, గ్రామీణాభివృద్ధి మరియు గ్రామీణ నీటి సరఫరా శాఖల మంత్రి.\"},\"photo\":\"/images/leaders/minister.png\",\"message\":{\"en\":\"\",\"te\":\"\"},\"showOnHome\":true}','published',20,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(20,'leaders','secretary','{\"name\":{\"en\":\"Dr. Hanumanthu Purushotham\",\"te\":\"డా. హనుమంతు పురుషోత్తం\"},\"designation\":{\"en\":\"Secretary to Government\",\"te\":\"ప్రభుత్వ కార్యదర్శి\"},\"portfolio\":{\"en\":\"Department of Science, Technology & Innovation, Government of Andhra Pradesh.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ.\"},\"photo\":\"/images/leaders/secretary.png\",\"message\":{\"en\":\"\",\"te\":\"\"},\"showOnHome\":true}','published',30,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58');
/*!40000 ALTER TABLE `cms_blocks` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cms_extras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_extras` (
  `resource` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int unsigned NOT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`resource`,`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cms_extras` WRITE;
/*!40000 ALTER TABLE `cms_extras` DISABLE KEYS */;
INSERT INTO `cms_extras` (`resource`, `record_id`, `data`, `updated_at`) VALUES ('audiences',1,'{\"icon\":\"Users\",\"links\":[{\"label\":{\"en\":\"About the Department\",\"te\":\"శాఖ పరిచయం\"},\"to\":\"/about\"},{\"label\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"to\":\"/organisations\"},{\"label\":{\"en\":\"Government Orders & Notifications\",\"te\":\"ప్రభుత్వ ఉత్తర్వులు & నోటిఫికేషన్లు\"},\"to\":\"/ecitizen/government-orders\"},{\"label\":{\"en\":\"Latest News & Events\",\"te\":\"తాజా వార్తలు & కార్యక్రమాలు\"},\"to\":\"/\"},{\"label\":{\"en\":\"RTI Information\",\"te\":\"సమాచార హక్కు వివరాలు\"},\"to\":\"/ecitizen/rti\"},{\"label\":{\"en\":\"Contact Us\",\"te\":\"సంప్రదించండి\"},\"to\":\"/contact\"}]}','2026-11-14 10:51:58'),('audiences',2,'{\"icon\":\"GraduationCap\",\"links\":[{\"label\":{\"en\":\"Science Outreach & Events\",\"te\":\"విజ్ఞాన ప్రచారం & కార్యక్రమాలు\"},\"to\":\"/media/events\"},{\"label\":{\"en\":\"Science Stories & Videos\",\"te\":\"విజ్ఞాన కథలు & వీడియోలు\"},\"to\":\"/media/science-stories\"},{\"label\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"to\":\"/organisations\"},{\"label\":{\"en\":\"Latest Announcements\",\"te\":\"తాజా ప్రకటనలు\"},\"to\":\"/ecitizen/notifications\"},{\"label\":{\"en\":\"Science Almanac\",\"te\":\"విజ్ఞాన పంచాంగం\"},\"to\":\"/\"},{\"label\":{\"en\":\"Useful Links\",\"te\":\"ఉపయోగకరమైన లింకులు\"},\"to\":\"/ecitizen/useful-links\"}]}','2026-11-14 10:51:58'),('audiences',3,'{\"icon\":\"FlaskConical\",\"links\":[{\"label\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"to\":\"/organisations\"},{\"label\":{\"en\":\"Research & Development Initiatives\",\"te\":\"పరిశోధన & అభివృద్ధి కార్యక్రమాలు\"},\"to\":\"/ict/projects\"},{\"label\":{\"en\":\"Policies & Government Orders\",\"te\":\"విధానాలు & ప్రభుత్వ ఉత్తర్వులు\"},\"to\":\"/policies\"},{\"label\":{\"en\":\"Programmes & Projects\",\"te\":\"కార్యక్రమాలు & ప్రాజెక్టులు\"},\"to\":\"/ict/projects\"},{\"label\":{\"en\":\"Events & Conclaves\",\"te\":\"కార్యక్రమాలు & సదస్సులు\"},\"to\":\"/media/events\"},{\"label\":{\"en\":\"Contact the Department\",\"te\":\"శాఖను సంప్రదించండి\"},\"to\":\"/contact\"}]}','2026-11-14 10:51:58'),('audiences',4,'{\"icon\":\"Briefcase\",\"links\":[{\"label\":{\"en\":\"Investor\'s Corner\",\"te\":\"పెట్టుబడిదారుల విభాగం\"},\"to\":\"/investors\"},{\"label\":{\"en\":\"Priority Technology Areas\",\"te\":\"ప్రాధాన్య సాంకేతిక రంగాలు\"},\"to\":\"/about\"},{\"label\":{\"en\":\"Policies & Incentives\",\"te\":\"విధానాలు & ప్రోత్సాహకాలు\"},\"to\":\"/policies\"},{\"label\":{\"en\":\"AP-FIRST\",\"te\":\"AP-FIRST\"},\"to\":\"/organisations/ap-first\"},{\"label\":{\"en\":\"Organisations\",\"te\":\"సంస్థలు\"},\"to\":\"/organisations\"},{\"label\":{\"en\":\"Contact / Investment Facilitation\",\"te\":\"సంప్రదింపు / పెట్టుబడి సహాయం\"},\"to\":\"/contact\"}]}','2026-11-14 10:51:58'),('districts',1,'{\"region\":\"north-coastal\",\"hq\":\"Srikakulam\",\"x\":322,\"y\":46,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',2,'{\"region\":\"north-coastal\",\"hq\":\"Parvathipuram\",\"x\":212,\"y\":104,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',3,'{\"region\":\"north-coastal\",\"hq\":\"Vizianagaram\",\"x\":262,\"y\":82,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',4,'{\"region\":\"north-coastal\",\"hq\":\"Visakhapatnam\",\"x\":278,\"y\":128,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',5,'{\"region\":\"north-coastal\",\"hq\":\"Paderu\",\"x\":216,\"y\":158,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',6,'{\"region\":\"north-coastal\",\"hq\":\"Anakapalli\",\"x\":258,\"y\":172,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',7,'{\"region\":\"godavari\",\"hq\":\"Kakinada\",\"x\":306,\"y\":222,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',8,'{\"region\":\"godavari\",\"hq\":\"Rajahmundry\",\"x\":252,\"y\":248,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',9,'{\"region\":\"godavari\",\"hq\":\"Amalapuram\",\"x\":300,\"y\":262,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',10,'{\"region\":\"godavari\",\"hq\":\"Eluru\",\"x\":198,\"y\":252,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',11,'{\"region\":\"godavari\",\"hq\":\"Bhimavaram\",\"x\":214,\"y\":288,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',12,'{\"region\":\"krishna\",\"hq\":\"Vijayawada\",\"x\":252,\"y\":278,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',13,'{\"region\":\"krishna\",\"hq\":\"Machilipatnam\",\"x\":242,\"y\":308,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',14,'{\"region\":\"krishna\",\"hq\":\"Narasaraopet\",\"x\":214,\"y\":334,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',15,'{\"region\":\"krishna\",\"hq\":\"Guntur\",\"x\":256,\"y\":348,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',16,'{\"region\":\"south-coastal\",\"hq\":\"Bapatla\",\"x\":266,\"y\":388,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',17,'{\"region\":\"south-coastal\",\"hq\":\"Ongole\",\"x\":256,\"y\":428,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',18,'{\"region\":\"south-coastal\",\"hq\":\"Nellore\",\"x\":272,\"y\":472,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',19,'{\"region\":\"rayalaseema\",\"hq\":\"Kurnool\",\"x\":156,\"y\":360,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',20,'{\"region\":\"rayalaseema\",\"hq\":\"Nandyal\",\"x\":176,\"y\":404,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',21,'{\"region\":\"rayalaseema\",\"hq\":\"Anantapur\",\"x\":122,\"y\":502,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',22,'{\"region\":\"rayalaseema\",\"hq\":\"Puttaparthi\",\"x\":150,\"y\":442,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',23,'{\"region\":\"rayalaseema\",\"hq\":\"Kadapa\",\"x\":178,\"y\":482,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',24,'{\"region\":\"rayalaseema\",\"hq\":\"Rayachoti\",\"x\":204,\"y\":522,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',25,'{\"region\":\"rayalaseema\",\"hq\":\"Chittoor\",\"x\":228,\"y\":562,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',26,'{\"region\":\"south-coastal\",\"hq\":\"Tirupati\",\"x\":252,\"y\":512,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',27,'{\"region\":\"south-coastal\",\"hq\":\"Markapuram\",\"x\":205,\"y\":420,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('districts',28,'{\"region\":\"godavari\",\"hq\":\"Polavaram\",\"x\":222,\"y\":270,\"institutions\":[],\"activities\":[]}','2026-11-14 10:51:58'),('documents',1,'{\"file\":\"\",\"type\":\"go\",\"topic\":\"\",\"department\":\"General Administration (Cabinet-II) Department\",\"size\":\"\"}','2026-11-14 10:51:58'),('documents',2,'{\"file\":\"\",\"type\":\"go\",\"topic\":\"\",\"department\":\"Environment & Forests (SEC.V) Department\",\"size\":\"\"}','2026-11-14 10:51:58'),('documents',3,'{\"file\":\"\",\"type\":\"go\",\"topic\":\"\",\"department\":\"General Administration (Cabinet-II) Department\",\"size\":\"\"}','2026-11-14 10:51:58'),('heroSlides',1,'{\"image\":\"\",\"ctaLabel\":{\"en\":\"About the Department\",\"te\":\"శాఖ గురించి\"}}','2026-11-14 10:51:58'),('heroSlides',2,'{\"image\":\"\",\"ctaLabel\":{\"en\":\"Explore Research\",\"te\":\"పరిశోధన వివరాలు\"}}','2026-11-14 10:51:58'),('heroSlides',3,'{\"image\":\"\",\"ctaLabel\":{\"en\":\"Explore Technology Areas\",\"te\":\"సాంకేతిక రంగాలు\"}}','2026-11-14 10:51:58'),('heroSlides',4,'{\"image\":\"\",\"ctaLabel\":{\"en\":\"Explore Organisations\",\"te\":\"సంస్థలను చూడండి\"}}','2026-11-14 10:51:58'),('news',1,'{\"category\":\"Government Order\",\"image\":\"\",\"isNew\":false}','2026-11-14 10:51:58'),('news',2,'{\"category\":\"Government Order\",\"image\":\"\",\"isNew\":false}','2026-11-14 10:51:58'),('news',3,'{\"category\":\"Government Order\",\"image\":\"\",\"isNew\":true}','2026-11-14 10:51:58'),('officers',1,'{\"office\":\"DST&I, Andhra Pradesh Secretariat\",\"roleTag\":\"\"}','2026-11-14 10:51:58'),('officers',2,'{\"office\":\"DST&I, Andhra Pradesh Secretariat\",\"roleTag\":\"\"}','2026-11-14 10:51:58'),('officers',3,'{\"office\":\"DST&I, Andhra Pradesh Secretariat\",\"roleTag\":\"\"}','2026-11-14 10:51:58'),('organisations',1,'{\"logo\":\"\",\"category\":\"Autonomous Organisation / State Council\",\"established\":1986,\"district\":\"ntr\",\"functions\":[{\"en\":\"Promotion of scientific research and technological advancement.\",\"te\":\"శాస్త్రీయ పరిశోధన మరియు సాంకేతిక అభివృద్ధిని ప్రోత్సహించడం.\"},{\"en\":\"Encouragement of innovation and grassroots technological solutions.\",\"te\":\"ఆవిష్కరణలు మరియు స్థూల స్థాయి సాంకేతిక పరిష్కారాలను ప్రోత్సహించడం.\"},{\"en\":\"Promotion of scientific temper and science popularisation among students and the general public.\",\"te\":\"విద్యార్థులు మరియు సాధారణ ప్రజలలో శాస్త్రీయ దృక్పథం, విజ్ఞాన ప్రచారాన్ని పెంపొందించడం.\"},{\"en\":\"Strengthening collaboration between academic institutions, research organisations, industries and government departments.\",\"te\":\"విద్యాసంస్థలు, పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వ శాఖల మధ్య సహకారాన్ని బలోపేతం చేయడం.\"},{\"en\":\"Supporting research projects, scientific initiatives and capacity-building programmes.\",\"te\":\"పరిశోధనా ప్రాజెక్టులు, శాస్త్రీయ కార్యక్రమాలు మరియు సామర్థ్య నిర్మాణ కార్యక్రమాలకు మద్దతు అందించడం.\"},{\"en\":\"Facilitating the application of science and technology to address developmental challenges.\",\"te\":\"అభివృద్ధి సంబంధిత సవాళ్ల పరిష్కారానికి విజ్ఞాన శాస్త్రం మరియు సాంకేతికత వినియోగాన్ని ప్రోత్సహించడం.\"},{\"en\":\"Promoting sustainable and inclusive development through science and technology.\",\"te\":\"విజ్ఞాన శాస్త్రం మరియు సాంకేతికత ద్వారా సుస్థిర, సమగ్ర అభివృద్ధిని ప్రోత్సహించడం.\"},{\"en\":\"Supporting evidence-based policymaking and scientific inputs for government initiatives.\",\"te\":\"ఆధారపూర్వక విధాన రూపకల్పనకు మరియు ప్రభుత్వ కార్యక్రమాలకు శాస్త్రీయ సలహాలను అందించడం.\"}]}','2026-11-14 10:51:58'),('organisations',2,'{\"logo\":\"\",\"category\":\"Science and technology centre / State-level science initiative\",\"established\":null,\"district\":\"\",\"functions\":[]}','2026-11-14 10:51:58'),('organisations',3,'{\"logo\":\"\",\"category\":\"State-level Science and Technology Academy / Scientific and Academic Institution\",\"established\":null,\"district\":\"\",\"functions\":[]}','2026-11-14 10:51:58'),('organisations',4,'{\"logo\":\"\",\"category\":\"Section 8 Company under the Companies Act\",\"established\":2026,\"district\":\"\",\"functions\":[]}','2026-11-14 10:51:58'),('pages',1,'{\"subtitle\":{\"en\":\"Department of Science, Technology & Innovation\",\"te\":\"విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ\"},\"sections\":[{\"heading\":{\"en\":\"Introduction\",\"te\":\"పరిచయం\"},\"body\":[{\"en\":\"The Department of Science, Technology & Innovation (DST&I), Government of Andhra Pradesh, is entrusted with promoting scientific advancement, technological development, research and innovation across the State. The Department aims to strengthen Andhra Pradesh’s scientific and technological ecosystem by facilitating research, encouraging innovation, promoting technology adoption and fostering collaboration among government departments, academic institutions, research organisations, industries and other stakeholders.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వంలోని విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ (DST&I), రాష్ట్రవ్యాప్తంగా శాస్త్రీయ పురోగతి, సాంకేతిక అభివృద్ధి, పరిశోధన మరియు ఆవిష్కరణలను ప్రోత్సహించే బాధ్యతను నిర్వహిస్తుంది. పరిశోధనను సులభతరం చేయడం, ఆవిష్కరణలను ప్రోత్సహించడం, సాంకేతిక వినియోగాన్ని పెంచడం మరియు ప్రభుత్వ శాఖలు, విద్యాసంస్థలు, పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు ఇతర భాగస్వాముల మధ్య సహకారాన్ని పెంపొందించడం ద్వారా ఆంధ్రప్రదేశ్ శాస్త్రీయ, సాంకేతిక పర్యావరణ వ్యవస్థను బలోపేతం చేయడం ఈ శాఖ లక్ష్యం.\"},{\"en\":\"The Department was established through G.O.Ms.No.28, General Administration (Cabinet-II) Department, dated 06.03.2026, with the objective of providing focused administrative direction and coordination for Science, Technology & Innovation-related activities in Andhra Pradesh.\",\"te\":\"సాధారణ పరిపాలన (కేబినెట్-II) శాఖ జారీ చేసిన జీ.ఓ.ఎం.ఎస్. నం.28, తేదీ 06.03.2026 ద్వారా, ఆంధ్రప్రదేశ్‌లో విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన కార్యకలాపాలకు కేంద్రీకృత పరిపాలనా దిశానిర్దేశం మరియు సమన్వయం కల్పించే లక్ష్యంతో ఈ శాఖ ఏర్పాటు చేయబడింది.\"},{\"en\":\"The Department seeks to create an enabling environment for scientific research, development and innovation by supporting research institutions, universities, scientific organisations, technology-driven enterprises and innovation ecosystems. It works towards promoting research and development (R&D), facilitating the translation of scientific discoveries into practical applications, encouraging technology commercialisation and strengthening linkages between academia, industry and government.\",\"te\":\"పరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, శాస్త్రీయ సంస్థలు, సాంకేతిక ఆధారిత సంస్థలు మరియు ఆవిష్కరణ పర్యావరణ వ్యవస్థలకు మద్దతు అందించడం ద్వారా శాస్త్రీయ పరిశోధన, అభివృద్ధి మరియు ఆవిష్కరణలకు అనుకూలమైన వాతావరణాన్ని సృష్టించడం ఈ శాఖ లక్ష్యం. పరిశోధన మరియు అభివృద్ధిని (R&D) ప్రోత్సహించడం, శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలుగా మార్చడాన్ని సులభతరం చేయడం, సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించడం మరియు విద్యాసంస్థలు, పరిశ్రమలు, ప్రభుత్వాల మధ్య సంబంధాలను బలోపేతం చేయడం కోసం ఇది కృషి చేస్తుంది.\"},{\"en\":\"Its areas of focus include the promotion of science and scientific temper, emerging and advanced technologies, information technology, electronics, space technology and applications, innovation, research and development, start-up ecosystems and technology-led solutions for governance and public service delivery. The Department also seeks to encourage the adoption of emerging technologies and facilitate partnerships with national and international research institutions, industries and knowledge organisations.\",\"te\":\"శాస్త్రీయ దృక్పథం మరియు విజ్ఞాన ప్రచారం, అభివృద్ధి చెందుతున్న మరియు ఆధునిక సాంకేతికతలు, సమాచార సాంకేతికత, ఎలక్ట్రానిక్స్, అంతరిక్ష సాంకేతికత మరియు అనువర్తనాలు, ఆవిష్కరణలు, పరిశోధన మరియు అభివృద్ధి, స్టార్టప్ పర్యావరణ వ్యవస్థలు మరియు పరిపాలన, ప్రజా సేవలలో సాంకేతిక ఆధారిత పరిష్కారాలు ఈ శాఖ దృష్టి కేంద్రాలలో ఉన్నాయి. అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం మరియు జాతీయ, అంతర్జాతీయ పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు విజ్ఞాన సంస్థలతో భాగస్వామ్యాలను సులభతరం చేయడం కూడా ఈ శాఖ లక్ష్యం.\"},{\"en\":\"Through coordination with institutions and organisations associated with science, technology and innovation, the Department aims to strengthen research infrastructure, promote scientific awareness, support innovation-driven initiatives and facilitate the development of technology-based solutions to address societal and developmental challenges.\",\"te\":\"విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన సంస్థలతో సమన్వయం ద్వారా, పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, శాస్త్రీయ అవగాహనను ప్రోత్సహించడం, ఆవిష్కరణ ఆధారిత కార్యక్రమాలకు మద్దతు అందించడం మరియు సామాజిక, అభివృద్ధి సవాళ్లను పరిష్కరించడానికి సాంకేతిక ఆధారిత పరిష్కారాలను అభివృద్ధి చేయడం ఈ శాఖ లక్ష్యం.\"},{\"en\":\"The Department envisions positioning Andhra Pradesh as a leading destination for scientific research, technological advancement and innovation, contributing to sustainable economic growth, employment generation, improved public services and the State’s long-term development vision of Swarna Andhra Pradesh @ 2047.\",\"te\":\"శాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలకు ఆంధ్రప్రదేశ్‌ను ప్రముఖ గమ్యస్థానంగా నిలపడం, సుస్థిర ఆర్థిక వృద్ధి, ఉపాధి కల్పన, మెరుగైన ప్రజా సేవలు మరియు స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 దీర్ఘకాలిక అభివృద్ధి లక్ష్యానికి దోహదపడటం ఈ శాఖ ఆకాంక్ష.\"}]}]}','2026-11-14 10:51:58'),('pages',2,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Vision\",\"te\":\"దృష్టి\"},\"body\":[{\"en\":\"To position Andhra Pradesh as a leading national and global hub for scientific research, technological advancement and innovation, fostering a knowledge-driven and innovation-led economy in alignment with the vision of Swarna Andhra Pradesh @ 2047.\",\"te\":\"స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 లక్ష్యానికి అనుగుణంగా, శాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలలో ఆంధ్రప్రదేశ్‌ను జాతీయ మరియు అంతర్జాతీయ ప్రముఖ కేంద్రంగా నిలపడం, విజ్ఞాన ఆధారిత మరియు ఆవిష్కరణ ఆధారిత ఆర్థిక వ్యవస్థను అభివృద్ధి చేయడం.\"}]},{\"heading\":{\"en\":\"Mission\",\"te\":\"లక్ష్యం\"},\"body\":[{\"en\":\"To promote scientific research, technological development and innovation through effective policies, institutional coordination and strategic partnerships. To strengthen research infrastructure, encourage collaboration among academia, industry and government, facilitate technology transfer and commercialisation, and support the adoption of emerging technologies for sustainable development and improved quality of life in Andhra Pradesh.\",\"te\":\"సమర్థవంతమైన విధానాలు, సంస్థాగత సమన్వయం మరియు వ్యూహాత్మక భాగస్వామ్యాల ద్వారా శాస్త్రీయ పరిశోధన, సాంకేతిక అభివృద్ధి మరియు ఆవిష్కరణలను ప్రోత్సహించడం. పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారాన్ని ప్రోత్సహించడం, సాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం, ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి మరియు మెరుగైన జీవన ప్రమాణాల కోసం అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం.\"}]}]}','2026-11-14 10:51:58'),('pages',3,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Objectives of the Department\",\"te\":\"శాఖ యొక్క లక్ష్యాలు\"},\"body\":[{\"en\":\"Promote Scientific Research and Development: Encourage and facilitate scientific research and R&D activities across universities, research institutions and other eligible organisations in Andhra Pradesh.\",\"te\":\"శాస్త్రీయ పరిశోధన మరియు అభివృద్ధిని ప్రోత్సహించడం: ఆంధ్రప్రదేశ్‌లోని విశ్వవిద్యాలయాలు, పరిశోధనా సంస్థలు మరియు ఇతర అర్హత కలిగిన సంస్థలలో శాస్త్రీయ పరిశోధన మరియు పరిశోధన–అభివృద్ధి కార్యకలాపాలను ప్రోత్సహించడం.\"},{\"en\":\"Strengthen Research Infrastructure: Support the development, modernisation and effective utilisation of scientific laboratories, research facilities, testing centres and advanced technological infrastructure.\",\"te\":\"పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం: శాస్త్రీయ ప్రయోగశాలలు, పరిశోధనా కేంద్రాలు, పరీక్షా కేంద్రాలు మరియు ఆధునిక సాంకేతిక మౌలిక సదుపాయాల అభివృద్ధి, ఆధునీకరణ మరియు సమర్థవంతమైన వినియోగానికి తోడ్పడటం.\"},{\"en\":\"Foster Innovation and Entrepreneurship: Promote innovation ecosystems, technology incubation, start-ups and entrepreneurship by facilitating collaboration between academia, industry and government.\",\"te\":\"ఆవిష్కరణలు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం: విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారం ద్వారా ఆవిష్కరణ వ్యవస్థలు, సాంకేతిక ఇంక్యుబేషన్ కేంద్రాలు, స్టార్టప్‌లు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం.\"},{\"en\":\"Advance Emerging Technologies: Encourage the adoption, development and application of emerging and advanced technologies, including Artificial Intelligence, Quantum Technologies, Space Technology, Electronics and other frontier technologies.\",\"te\":\"అభివృద్ధి చెందుతున్న సాంకేతికతలను ప్రోత్సహించడం: కృత్రిమ మేధస్సు (AI), క్వాంటం సాంకేతికతలు, అంతరిక్ష సాంకేతికత, ఎలక్ట్రానిక్స్ మరియు ఇతర ఆధునిక సాంకేతిక రంగాల అభివృద్ధి, ప్రవేశం మరియు అనువర్తనాలను ప్రోత్సహించడం.\"},{\"en\":\"Facilitate Technology Transfer and Commercialisation: Promote the conversion of research outcomes and scientific discoveries into practical applications, products, services and commercially viable technologies.\",\"te\":\"సాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం: పరిశోధన ఫలితాలు మరియు శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలు, ఉత్పత్తులు, సేవలు మరియు వాణిజ్యపరంగా ఉపయోగపడే సాంకేతికతలుగా మార్చడాన్ని ప్రోత్సహించడం.\"},{\"en\":\"Promote Scientific Temper and Awareness: Encourage scientific awareness, research orientation and science outreach activities among students, youth, educational institutions and the general public.\",\"te\":\"శాస్త్రీయ దృక్పథం మరియు అవగాహనను పెంపొందించడం: విద్యార్థులు, యువత, విద్యాసంస్థలు మరియు సాధారణ ప్రజలలో శాస్త్రీయ అవగాహన, పరిశోధనా ఆసక్తి మరియు విజ్ఞాన ప్రచార కార్యక్రమాలను ప్రోత్సహించడం.\"},{\"en\":\"Strengthen Institutional and Strategic Partnerships: Facilitate collaboration with national and international research institutions, universities, industries, government agencies and scientific organisations.\",\"te\":\"సంస్థాగత మరియు వ్యూహాత్మక భాగస్వామ్యాలను బలోపేతం చేయడం: జాతీయ మరియు అంతర్జాతీయ పరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, పరిశ్రమలు, ప్రభుత్వ సంస్థలు మరియు శాస్త్రీయ సంస్థలతో సహకారాన్ని ప్రోత్సహించడం.\"},{\"en\":\"Leverage Science and Technology for Development: Promote the application of science, technology and innovation to address societal challenges, improve public service delivery, generate employment and support sustainable development in Andhra Pradesh.\",\"te\":\"అభివృద్ధి కోసం విజ్ఞాన శాస్త్రం మరియు సాంకేతికతను వినియోగించడం: సామాజిక సవాళ్ల పరిష్కారం, ప్రజా సేవల మెరుగుదల, ఉపాధి కల్పన మరియు ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి కోసం విజ్ఞాన శాస్త్రం, సాంకేతికత మరియు ఆవిష్కరణల అనువర్తనాలను ప్రోత్సహించడం.\"}]}]}','2026-11-14 10:51:58'),('pages',4,'{\"subtitle\":{\"en\":\"Government Orders, notifications, circulars, acts, rules and guidelines\",\"te\":\"ప్రభుత్వ ఉత్తర్వులు, నోటిఫికేషన్లు, సర్క్యులర్లు, చట్టాలు, నియమాలు మరియు మార్గదర్శకాలు\"},\"sections\":[{\"heading\":{\"en\":\"Government Orders, notifications, circulars, acts, rules and guidelines\",\"te\":\"ప్రభుత్వ ఉత్తర్వులు, నోటిఫికేషన్లు, సర్క్యులర్లు, చట్టాలు, నియమాలు మరియు మార్గదర్శకాలు\"},\"body\":[{\"en\":\"Government Orders, notifications, circulars, acts, rules and guidelines approved for publication by the Department are listed in this section.\",\"te\":\"ప్రచురణకు ఆమోదించబడిన ప్రభుత్వ ఉత్తర్వులు, నోటిఫికేషన్లు, సర్క్యులర్లు, చట్టాలు, నియమాలు మరియు మార్గదర్శకాలు ఈ విభాగంలో జాబితా చేయబడతాయి.\"}]},{\"heading\":{\"en\":\"e-Governance services\",\"te\":\"ఇ-గవర్నెన్స్ సేవలు\"},\"body\":[{\"en\":\"At present, the Department of Science, Technology & Innovation does not operate any standalone citizen-facing e-Governance services, online application systems or mobile applications.\",\"te\":\"ప్రస్తుతం విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఎటువంటి ప్రత్యేక పౌర-కేంద్రిత ఇ-గవర్నెన్స్ సేవలు, ఆన్‌లైన్ దరఖాస్తు వ్యవస్థలు లేదా మొబైల్ అనువర్తనాలను నిర్వహించడం లేదు.\"}]}]}','2026-11-14 10:51:58'),('pages',5,'{\"subtitle\":{\"en\":\"Information under the Right to Information Act, 2005\",\"te\":\"సమాచార హక్కు చట్టం, 2005 ప్రకారం సమాచారం\"},\"sections\":[{\"heading\":{\"en\":\"Public Information Officers and APIOs\",\"te\":\"ప్రజా సమాచార అధికారులు మరియు సహాయ ప్రజా సమాచార అధికారులు\"},\"body\":[{\"en\":\"Under the Right to Information Act, 2005, any citizen may request information held by the Department by applying to the Public Information Officer along with the prescribed fee.\",\"te\":\"సమాచార హక్కు చట్టం, 2005 ప్రకారం, ఏ పౌరుడైనా నిర్దేశిత రుసుముతో ప్రజా సమాచార అధికారికి దరఖాస్తు చేసి శాఖ వద్ద ఉన్న సమాచారాన్ని అభ్యర్థించవచ్చు.\"},{\"en\":\"The details of the Public Information Officer and Assistant Public Information Officers will be published after nomination by the Department.\",\"te\":\"ప్రజా సమాచార అధికారి మరియు సహాయ ప్రజా సమాచార అధికారుల వివరాలు శాఖ నియమించిన తర్వాత ప్రచురించబడతాయి.\"}]},{\"heading\":{\"en\":\"First Appellate Authority\",\"te\":\"మొదటి అప్పీల్ అధికారి\"},\"body\":[{\"en\":\"The First Appellate Authority under the Right to Information Act, 2005 will be published after notification.\",\"te\":\"సమాచార హక్కు చట్టం, 2005 ప్రకారం మొదటి అప్పీల్ అధికారి వివరాలు ప్రకటన తర్వాత ప్రచురించబడతాయి.\"}]},{\"heading\":{\"en\":\"Section 4(1)(b) proactive disclosure\",\"te\":\"సెక్షన్ 4(1)(b) ప్రత్యేక ప్రకటన\"},\"body\":[{\"en\":\"Information disclosed proactively under Section 4(1)(b) of the Right to Information Act, 2005 will be published in this section.\",\"te\":\"సమాచార హక్కు చట్టం, 2005 లోని సెక్షన్ 4(1)(b) ప్రకారం ప్రత్యేకంగా వెల్లడించే సమాచారం ఈ విభాగంలో ప్రచురించబడుతుంది.\"}]},{\"heading\":{\"en\":\"How to apply for RTI information\",\"te\":\"RTI సమాచారం కోసం దరఖాస్తు ఎలా చేయాలి\"},\"body\":[{\"en\":\"Applications may be submitted to the designated Public Information Officer under the Right to Information Act, 2005. The Department will publish the relevant officer and application details.\",\"te\":\"సమాచార హక్కు చట్టం, 2005 ప్రకారం నియమించబడిన ప్రజా సమాచార అధికారికి దరఖాస్తులు సమర్పించవచ్చు. సంబంధిత అధికారి మరియు దరఖాస్తు వివరాలను శాఖ ప్రచురిస్తుంది.\"}]},{\"heading\":{\"en\":\"RTI annual returns\",\"te\":\"RTI వార్షిక నివేదికలు\"},\"body\":[{\"en\":\"The annual returns of the Department under the Right to Information Act, 2005 will be published here.\",\"te\":\"సమాచార హక్కు చట్టం, 2005 ప్రకారం శాఖ వార్షిక నివేదికలు ఇక్కడ ప్రచురించబడతాయి.\"}]}]}','2026-11-14 10:51:58'),('pages',6,'{\"subtitle\":{\"en\":\"Statutory information\",\"te\":\"చట్టబద్ధ సమాచారం\"},\"sections\":[{\"heading\":{\"en\":\"Information Technology Act, 2000\",\"te\":\"సమాచార సాంకేతిక చట్టం, 2000\"},\"body\":[{\"en\":\"Statutory information and documents relating to the Information Technology Act, 2000 will be published in this section after approval by the Department.\",\"te\":\"సమాచార సాంకేతిక చట్టం, 2000 కి సంబంధించిన చట్టబద్ధ సమాచారం మరియు పత్రాలు శాఖ ఆమోదం తర్వాత ఈ విభాగంలో ప్రచురించబడతాయి.\"}]}]}','2026-11-14 10:51:58'),('pages',7,'{\"subtitle\":{\"en\":\"Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013\",\"te\":\"కార్యస్థలంలో మహిళలపై లైంగిక వేధింపుల (నివారణ, నిషేధం మరియు పరిష్కారం) చట్టం, 2013\"},\"sections\":[{\"heading\":{\"en\":\"Internal Complaints Committee\",\"te\":\"అంతర్గత ఫిర్యాదుల కమిటీ\"},\"body\":[{\"en\":\"The constitution and contact details of the Internal Complaints Committee will be published after notification by the Department.\",\"te\":\"అంతర్గత ఫిర్యాదుల కమిటీ ఏర్పాటు మరియు సంప్రదింపు వివరాలు శాఖ ప్రకటన తర్వాత ప్రచురించబడతాయి.\"}]}]}','2026-11-14 10:51:58'),('pages',8,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Citizen’s Charter\",\"te\":\"పౌర చార్టర్\"},\"body\":[{\"en\":\"The Citizen’s Charter of the Department, setting out the services offered and the standards of service delivery, will be published after approval by the competent authority.\",\"te\":\"శాఖ అందించే సేవలు మరియు సేవా ప్రమాణాలను వివరించే పౌర చార్టర్, సంబంధిత అధికారి ఆమోదం తర్వాత ప్రచురించబడుతుంది.\"}]}]}','2026-11-14 10:51:58'),('pages',9,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Purpose\",\"te\":\"ఉద్దేశ్యం\"},\"body\":[{\"en\":\"The official website of the Department of Science, Technology & Innovation, Government of Andhra Pradesh, is intended to provide citizens, researchers, students, academic institutions, industries, investors and other stakeholders with information about the Department, its functions, initiatives, policies, organisations, programmes and activities.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్, శాఖ, దాని విధులు, కార్యక్రమాలు, విధానాలు, సంస్థలు మరియు కార్యకలాపాల సమాచారాన్ని పౌరులు, పరిశోధకులు, విద్యార్థులు, విద్యాసంస్థలు, పరిశ్రమలు మరియు పెట్టుబడిదారులకు అందించడానికి ఉద్దేశించబడింది.\"}]},{\"heading\":{\"en\":\"Content and information\",\"te\":\"విషయం మరియు సమాచారం\"},\"body\":[{\"en\":\"1. The website shall publish information relating to the Department’s approved functions, activities, policies, programmes, notifications and public communications.\",\"te\":\"\"},{\"en\":\"2. Content shall be reviewed and approved by the designated departmental authority before publication.\",\"te\":\"\"},{\"en\":\"3. Information shall be presented in clear, accurate and accessible language, in English and Telugu wherever applicable.\",\"te\":\"\"},{\"en\":\"4. Government Orders, official notifications and other authoritative records shall be treated as the primary sources for official decisions and instructions.\",\"te\":\"\"},{\"en\":\"5. Information shall be updated when changes are communicated by the concerned sections or competent authorities.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Website availability and maintenance\",\"te\":\"వెబ్‌సైట్ లభ్యత మరియు నిర్వహణ\"},\"body\":[{\"en\":\"The Department shall make reasonable efforts to ensure that the website remains accessible. The website may be temporarily unavailable due to maintenance, technical issues, security incidents or circumstances beyond the Department’s control.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Accessibility\",\"te\":\"సులభ ప్రాప్యత\"},\"body\":[{\"en\":\"The website shall be developed and maintained with the objective of providing accessible information and services in accordance with applicable Government of India guidelines and accessibility standards.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"External links\",\"te\":\"బాహ్య లింకులు\"},\"body\":[{\"en\":\"Links to external websites may be provided for the convenience of users. The Department does not control the content, availability or privacy practices of external websites.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Privacy and security\",\"te\":\"గోప్యత మరియు భద్రత\"},\"body\":[{\"en\":\"Personal information submitted through website forms, if any, shall be handled in accordance with the approved Privacy Policy and applicable rules. Technical and administrative safeguards shall be followed to protect website information and services.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Contact\",\"te\":\"సంప్రదింపు\"},\"body\":[{\"en\":\"For website-related queries, users may contact:\",\"te\":\"\"},{\"en\":\"Department: Department of Science, Technology & Innovation, Government of Andhra Pradesh\",\"te\":\"\"},{\"en\":\"Email: [Approved website support email]\",\"te\":\"\"},{\"en\":\"Phone: [Approved website support contact]\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Telugu summary — proposed\",\"te\":\"తెలుగు సారాంశం – ప్రతిపాదిత\"},\"body\":[{\"en\":\"\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్ ద్వారా శాఖకు సంబంధించిన విధానాలు, కార్యక్రమాలు, ఉత్తర్వులు, సంస్థలు మరియు కార్యకలాపాల సమాచారాన్ని ప్రజలకు అందించడం ఈ వెబ్‌సైట్ ప్రధాన ఉద్దేశ్యం. వెబ్‌సైట్‌లో ప్రచురించే సమాచారం సంబంధిత శాఖాధికారుల పరిశీలన మరియు ఆమోదం అనంతరం అందుబాటులో ఉంచబడుతుంది.\"}]}]}','2026-11-14 10:51:58'),('pages',10,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Copyright\",\"te\":\"కాపీరైట్\"},\"body\":[{\"en\":\"Unless otherwise specified, the content published on this website is owned, held or controlled by the Government of Andhra Pradesh or the respective content owner.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Permitted reuse\",\"te\":\"అనుమతించబడిన పునర్వినియోగం\"},\"body\":[{\"en\":\"Users may reproduce or reuse website content for lawful, non-commercial and informational purposes, subject to the following conditions:\",\"te\":\"\"},{\"en\":\"1. The source and Department shall be appropriately acknowledged.\",\"te\":\"\"},{\"en\":\"2. The content shall not be presented in a misleading or distorted manner.\",\"te\":\"\"},{\"en\":\"3. Reuse shall not imply endorsement by the Department or the Government of Andhra Pradesh.\",\"te\":\"\"},{\"en\":\"4. Third-party content, photographs, illustrations, logos and other material shall not be reproduced without obtaining the necessary permission from the respective rights holder.\",\"te\":\"\"},{\"en\":\"5. The State Emblem, Government logos, Department identity marks and official seals shall not be used without the required authorisation.\",\"te\":\"\"},{\"en\":\"6. Commercial reproduction or other restricted use shall require prior written permission from the competent authority or rights holder.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Specific notices\",\"te\":\"ప్రత్యేక నోటీసులు\"},\"body\":[{\"en\":\"Where a specific copyright notice or licence is displayed against any content, that notice shall prevail.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Telugu summary — proposed\",\"te\":\"తెలుగు సారాంశం – ప్రతిపాదిత\"},\"body\":[{\"en\":\"\",\"te\":\"ఈ వెబ్‌సైట్‌లోని సమాచారాన్ని చటబద్ధమైన, వాణిజ్యేతర మరియు సమాచార ప్రయోజనాల కోసం ఉపయోగించవచ్చు; అయితే మూలాన్ని మరియు శాఖను తగిన విధంగా పేర్కొనాలి. మూడవ పక్షానికి చెందిన చిత్రాలు, లోగోలు మరియు ఇతర సమాచారాన్ని సంబంధిత హక్కుదారుల అనుమతి లేకుండా పునరుత్పత్తి చేయకూడదు.\"}]}]}','2026-11-14 10:51:58'),('pages',11,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Links to external websites\",\"te\":\"బాహ్య వెబ్‌సైట్లకు లింకులు\"},\"body\":[{\"en\":\"The Department’s website may contain links to other Government departments, public institutions, academic organisations, research institutions and external websites for the convenience of users.\",\"te\":\"\"},{\"en\":\"External links are provided for information and reference.\",\"te\":\"\"},{\"en\":\"The presence of a link shall not be interpreted as an endorsement of the linked website, its organisation, products or services.\",\"te\":\"\"},{\"en\":\"The Department does not control the content, accuracy, availability or privacy practices of external websites.\",\"te\":\"\"},{\"en\":\"Users are advised to review the terms and privacy policies of external websites before using them.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Links to the Department’s website\",\"te\":\"శాఖ వెబ్‌సైట్‌కు లింకులు\"},\"body\":[{\"en\":\"Other websites wishing to provide links to the Department’s website should:\",\"te\":\"\"},{\"en\":\"1. Link directly to the relevant publicly accessible page.\",\"te\":\"\"},{\"en\":\"2. Ensure that the link does not misrepresent the Department or the Government of Andhra Pradesh.\",\"te\":\"\"},{\"en\":\"3. Not use the Department’s name, official logo, State Emblem or other official identity elements in a manner that suggests endorsement or affiliation without permission.\",\"te\":\"\"},{\"en\":\"4. Not display the Department’s website within another website’s frame in a way that misrepresents its ownership or origin.\",\"te\":\"\"},{\"en\":\"The Department reserves the right to request the removal of links that are misleading, unauthorised or inconsistent with Government policy.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',12,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Privacy Policy\",\"te\":\"గోప్యతా విధానం\"},\"body\":[{\"en\":\"The Department of Science, Technology & Innovation respects the privacy of visitors to its official website. This policy explains how personal information may be collected, used and protected when users access the website or submit information through its online forms.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Information that may be collected\",\"te\":\"సేకరించే సమాచారం\"},\"body\":[{\"en\":\"Where an online feedback or enquiry facility is enabled, the website may collect information such as name, email address, contact number if requested, subject or category of enquiry, the feedback or message submitted by the user, and attachments if the facility is provided.\",\"te\":\"\"},{\"en\":\"Only information necessary for the stated purpose should be requested.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Purpose of collection\",\"te\":\"సేకరణ ఉద్దేశ్యం\"},\"body\":[{\"en\":\"1. Respond to enquiries and feedback.\",\"te\":\"\"},{\"en\":\"2. Forward requests to the concerned departmental section or authority.\",\"te\":\"\"},{\"en\":\"3. Maintain records of communications received.\",\"te\":\"\"},{\"en\":\"4. Improve website information and public communication.\",\"te\":\"\"},{\"en\":\"5. Protect the website and its services against misuse, where technically applicable.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Use and disclosure of information\",\"te\":\"సమాచార వినియోగం మరియు వెల్లడి\"},\"body\":[{\"en\":\"Personal information shall be accessed only by authorised personnel for official purposes. It shall not be disclosed to unauthorised parties, except where disclosure is required or permitted under applicable law, Government instructions or lawful directions of a competent authority.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Retention of information\",\"te\":\"సమాచార నిల్వ\"},\"body\":[{\"en\":\"Information shall be retained in accordance with applicable Government record-retention requirements and the approved departmental retention schedule. A specific retention period shall be published only after it is formally determined.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Security\",\"te\":\"భద్రత\"},\"body\":[{\"en\":\"Reasonable administrative and technical safeguards shall be adopted to protect information submitted through the website. Users should avoid submitting passwords, financial details or other sensitive personal information through general feedback forms.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Cookies and third-party services\",\"te\":\"కుకీలు మరియు మూడవ పక్ష సేవలు\"},\"body\":[{\"en\":\"Details of cookies, analytics, hosting services and other third-party technical services shall be disclosed after the website’s actual technical configuration has been verified. No specific tracking or analytics practice is asserted in this draft.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Privacy-related contact\",\"te\":\"గోప్యత సంబంధిత సంప్రదింపు\"},\"body\":[{\"en\":\"For privacy-related questions, users may contact:\",\"te\":\"\"},{\"en\":\"Designated officer: [To be nominated]\",\"te\":\"\"},{\"en\":\"Email: [Approved privacy contact email]\",\"te\":\"\"},{\"en\":\"Address: Department of Science, Technology & Innovation, Government of Andhra Pradesh, AP Secretariat, Velagapudi, Amaravati, Andhra Pradesh.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',13,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Terms of Use\",\"te\":\"ఉపయోగ నిబంధనలు\"},\"body\":[{\"en\":\"The Department of Science, Technology & Innovation, Government of Andhra Pradesh, provides this website to facilitate public access to information relating to its functions, activities, policies, organisations and initiatives.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Permitted use\",\"te\":\"అనుమతించబడిన వినియోగం\"},\"body\":[{\"en\":\"Users shall not misuse the website, attempt unauthorised access, interfere with its operation or use its content for unlawful or misleading purposes.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Online services\",\"te\":\"ఆన్‌లైన్ సేవలు\"},\"body\":[{\"en\":\"Unless a specific online service or submission facility is expressly provided, information displayed on this website shall not be treated as an electronic application, official submission or acknowledgement to the Department.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Review\",\"te\":\"సమీక్ష\"},\"body\":[{\"en\":\"These terms may be revised from time to time, subject to approval by the competent authority.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',14,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Accuracy of information\",\"te\":\"సమాచార ఖచ్చితత్వం\"},\"body\":[{\"en\":\"The Department makes reasonable efforts to ensure that the information published on this website is accurate and current. However, users are advised to verify important information with the concerned authority before relying on it for official or legal purposes.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Official documents\",\"te\":\"అధికారిక పత్రాలు\"},\"body\":[{\"en\":\"Where information on this website differs from an applicable Government Order, notification, statutory instrument or other authoritative official document, the relevant official document shall prevail.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"External websites\",\"te\":\"బాహ్య వెబ్‌సైట్లు\"},\"body\":[{\"en\":\"This website may provide links to external websites. The Department is not responsible for the content, accuracy, availability or practices of those websites.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Availability\",\"te\":\"లభ్యత\"},\"body\":[{\"en\":\"The Department does not guarantee uninterrupted access to the website. Access may be affected by maintenance, technical failures, network interruptions or other circumstances.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',15,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Commitment\",\"te\":\"నిబద్ధత\"},\"body\":[{\"en\":\"The Department of Science, Technology & Innovation, Government of Andhra Pradesh, is committed to improving the accessibility and usability of its official website so that information can be accessed by all users, including persons with disabilities.\",\"te\":\"\"},{\"en\":\"The Department proposes to develop and maintain the website in accordance with the applicable Guidelines for Indian Government Websites (GIGW 3.0) and the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Accessibility features to be provided and assessed\",\"te\":\"అందించవలసిన మరియు అంచనా వేయవలసిన ప్రాప్యత లక్షణాలు\"},\"body\":[{\"en\":\"Text alternatives for meaningful images and visual content.\",\"te\":\"\"},{\"en\":\"Clear headings and logical page structure.\",\"te\":\"\"},{\"en\":\"Keyboard-accessible navigation and controls.\",\"te\":\"\"},{\"en\":\"Adequate colour contrast and readable text.\",\"te\":\"\"},{\"en\":\"Captions or transcripts for relevant audio and video content.\",\"te\":\"\"},{\"en\":\"Accessible document formats wherever practicable.\",\"te\":\"\"},{\"en\":\"Clear labels and instructions for online forms.\",\"te\":\"\"},{\"en\":\"English and Telugu content wherever applicable.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Feedback and accessibility support\",\"te\":\"అభిప్రాయం మరియు ప్రాప్యత సహాయం\"},\"body\":[{\"en\":\"Users experiencing difficulty accessing information on the website may report the issue through:\",\"te\":\"\"},{\"en\":\"Email: [Approved accessibility contact email]\",\"te\":\"\"},{\"en\":\"Phone: [Approved accessibility contact number]\",\"te\":\"\"},{\"en\":\"Contact person/designation: [To be nominated]\",\"te\":\"\"},{\"en\":\"The Department shall examine accessibility-related feedback and take appropriate corrective action, subject to technical feasibility and applicable guidelines.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',16,'{\"subtitle\":{\"en\":\"Access the website with a screen reader\",\"te\":\"స్క్రీన్ రీడర్‌తో వెబ్‌సైట్‌ను యాక్సెస్ చేయండి\"},\"sections\":[{\"heading\":{\"en\":\"Screen reader access\",\"te\":\"స్క్రీన్ రీడర్ ప్రాప్యత\"},\"body\":[{\"en\":\"The website is designed to be used with screen reader software. Keyboard-accessible navigation, clear headings, logical page structure and text alternatives for meaningful images are provided.\",\"te\":\"స్క్రీన్ రీడర్ సాఫ్ట్‌వేర్‌తో ఉపయోగించడానికి వెబ్‌సైట్ రూపొందించబడింది. కీబోర్డ్ ద్వారా నావిగేషన్, స్పష్టమైన శీర్షికలు, క్రమబద్ధమైన పేజీ నిర్మాణం మరియు చిత్రాలకు ప్రత్యామ్నాయ వచనం అందించబడతాయి.\"}]},{\"heading\":{\"en\":\"Language\",\"te\":\"భాష\"},\"body\":[{\"en\":\"Where available, users may select English or Telugu to access website information.\",\"te\":\"అందుబాటులో ఉన్న చోట, వెబ్‌సైట్ సమాచారాన్ని యాక్సెస్ చేయడానికి వినియోగదారులు ఇంగ్లీష్ లేదా తెలుగును ఎంచుకోవచ్చు.\"}]},{\"heading\":{\"en\":\"Assistance\",\"te\":\"సహాయం\"},\"body\":[{\"en\":\"Users who face difficulty accessing website content may refer to the Accessibility Statement and contact the designated accessibility support officer through the contact details published on the Contact page.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',17,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Objective\",\"te\":\"ఉద్దేశ్యం\"},\"body\":[{\"en\":\"To establish a clear process for creating, reviewing, approving, publishing and updating information on the official website of the Department.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Roles and responsibilities\",\"te\":\"పాత్రలు మరియు బాధ్యతలు\"},\"body\":[{\"en\":\"Content Originating Section — Prepare and submit accurate information and supporting documents.\",\"te\":\"\"},{\"en\":\"Section-level Verifying Officer — Verify facts, dates, designations, references and attachments.\",\"te\":\"\"},{\"en\":\"Designated Approving Authority — Approve content for publication.\",\"te\":\"\"},{\"en\":\"Website Nodal Officer — Coordinate content submission, review and publication.\",\"te\":\"\"},{\"en\":\"Website Administrator / Technical Team — Upload approved content and maintain website functionality.\",\"te\":\"\"},{\"en\":\"The names and official designations of the responsible officers shall be notified separately.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Content publication workflow\",\"te\":\"కంటెంట్ ప్రచురణ ప్రక్రియ\"},\"body\":[{\"en\":\"1. The concerned section prepares the content.\",\"te\":\"\"},{\"en\":\"2. The content is checked against official records and supporting documents.\",\"te\":\"\"},{\"en\":\"3. The authorised officer verifies the content.\",\"te\":\"\"},{\"en\":\"4. Approval is obtained from the competent authority.\",\"te\":\"\"},{\"en\":\"5. The approved content is forwarded to the Website Nodal Officer or authorised publisher.\",\"te\":\"\"},{\"en\":\"6. The website administrator publishes the content.\",\"te\":\"\"},{\"en\":\"7. The publication date, approving authority and revision details are recorded.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Content standards\",\"te\":\"కంటెంట్ ప్రమాణాలు\"},\"body\":[{\"en\":\"All website content should be factually accurate and supported by official records; use approved names, designations, dates and Government Order references; follow the Department’s approved terminology and communication standards; avoid unauthorised personal information or confidential material; use photographs and media for which the necessary permissions have been obtained; and be available in accessible formats wherever practicable.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Corrections and urgent updates\",\"te\":\"సవరణలు మరియు అత్యవసర నవీకరణలు\"},\"body\":[{\"en\":\"Corrections shall be routed through the concerned section and approving authority. Urgent changes, including security-related notices or critical public information, shall follow an expedited approval process authorised by the Department.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Record keeping\",\"te\":\"నమోదుల నిర్వహణ\"},\"body\":[{\"en\":\"The Department should maintain records of submitted content, approvals, publication dates, revisions and removal or archival decisions.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',18,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Objective\",\"te\":\"ఉద్దేశ్యం\"},\"body\":[{\"en\":\"To ensure that outdated, superseded or no-longer-current website content is reviewed and archived systematically, while preserving access to important Government information.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"General principles\",\"te\":\"సాధారణ సూత్రాలు\"},\"body\":[{\"en\":\"1. Current and valid information shall remain available in the relevant website section.\",\"te\":\"\"},{\"en\":\"2. Superseded content shall be clearly marked as archived or superseded.\",\"te\":\"\"},{\"en\":\"3. Archived Government Orders, policies and official documents should remain accessible where permitted by applicable rules.\",\"te\":\"\"},{\"en\":\"4. Content shall not be permanently deleted merely because it is no longer current.\",\"te\":\"\"},{\"en\":\"5. Records shall be retained in accordance with applicable State Government record-retention rules, departmental instructions and any legal or audit requirements.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Archival schedule\",\"te\":\"ఆర్కైవ్ షెడ్యూల్\"},\"body\":[{\"en\":\"Government Orders and notifications — Retain in the official document archive; mark superseded where applicable.\",\"te\":\"\"},{\"en\":\"Policies and guidelines — Retain current versions and preserve previous versions with clear status.\",\"te\":\"\"},{\"en\":\"Tenders and procurement notices — Archive after closure or completion of the relevant process.\",\"te\":\"\"},{\"en\":\"Press releases and announcements — Move older items to a dated archive.\",\"te\":\"\"},{\"en\":\"Events and programmes — Archive after the event or programme concludes.\",\"te\":\"\"},{\"en\":\"Reports and publications — Retain in a searchable publication archive.\",\"te\":\"\"},{\"en\":\"Officers and contact details — Replace outdated entries after verification; retain records as required.\",\"te\":\"\"},{\"en\":\"FAQs — Review and archive questions that are no longer relevant.\",\"te\":\"\"},{\"en\":\"Photographs and videos — Retain approved media in the relevant gallery or archive subject to permissions.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Approval and monitoring\",\"te\":\"ఆమోదం మరియు పర్యవేక్షణ\"},\"body\":[{\"en\":\"The concerned section shall identify content for archival. The Website Nodal Officer shall coordinate the process, and archival or deletion shall be carried out only after the required approval.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',19,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Objective\",\"te\":\"ఉద్దేశ్యం\"},\"body\":[{\"en\":\"To ensure that all information published on the Department’s website remains accurate, relevant, current and consistent with official records.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Review frequency\",\"te\":\"సమీక్ష పౌనఃపున్యం\"},\"body\":[{\"en\":\"Secretary and officers’ details — Monthly and whenever a change occurs.\",\"te\":\"\"},{\"en\":\"Department contact details — Monthly and whenever a change occurs.\",\"te\":\"\"},{\"en\":\"Government Orders and notifications — On receipt and before publication.\",\"te\":\"\"},{\"en\":\"Policies and guidelines — Annually and whenever revised.\",\"te\":\"\"},{\"en\":\"Tenders and procurement notices — Regularly during the active period.\",\"te\":\"\"},{\"en\":\"Latest news and announcements — Weekly or whenever new information is received.\",\"te\":\"\"},{\"en\":\"Events and programmes — Before publication and after completion.\",\"te\":\"\"},{\"en\":\"Photographs and videos — Quarterly.\",\"te\":\"\"},{\"en\":\"Reports and publications — On release and during periodic review.\",\"te\":\"\"},{\"en\":\"FAQs — Quarterly.\",\"te\":\"\"},{\"en\":\"District Explorer information — Quarterly and whenever verified changes occur.\",\"te\":\"\"},{\"en\":\"External links — Monthly.\",\"te\":\"\"},{\"en\":\"Accessibility information — Quarterly and after significant website changes.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Review process\",\"te\":\"సమీక్ష ప్రక్రియ\"},\"body\":[{\"en\":\"1. The Website Nodal Officer shall coordinate periodic reviews.\",\"te\":\"\"},{\"en\":\"2. The concerned section shall verify the accuracy of its respective content.\",\"te\":\"\"},{\"en\":\"3. Outdated information shall be corrected, replaced or archived after approval.\",\"te\":\"\"},{\"en\":\"4. Review dates and actions taken shall be recorded.\",\"te\":\"\"},{\"en\":\"5. Any major correction shall follow the approved content moderation and approval process.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Responsibility\",\"te\":\"బాధ్యత\"},\"body\":[{\"en\":\"Each concerned section shall be responsible for the accuracy of information supplied by it. The designated Website Nodal Officer shall coordinate the review process.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',20,'{\"subtitle\":{\"en\":\"\",\"te\":\"\"},\"sections\":[{\"heading\":{\"en\":\"Objective\",\"te\":\"ఉద్దేశ్యం\"},\"body\":[{\"en\":\"To establish a response mechanism for website downtime, security incidents, unauthorised changes, defacement, data loss and other situations that may affect the availability or integrity of the Department’s website.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Incident categories\",\"te\":\"సంఘటన రకాలు\"},\"body\":[{\"en\":\"Website unavailable or inaccessible.\",\"te\":\"\"},{\"en\":\"Website defacement or unauthorised content changes.\",\"te\":\"\"},{\"en\":\"Suspected cyberattack or security breach.\",\"te\":\"\"},{\"en\":\"Loss or corruption of website data.\",\"te\":\"\"},{\"en\":\"Failure of hosting, network or other technical infrastructure.\",\"te\":\"\"},{\"en\":\"Unauthorised disclosure of information.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Response procedure\",\"te\":\"స్పందన ప్రక్రియ\"},\"body\":[{\"en\":\"1. Detection — Identify and record the incident, including the time and affected website services.\",\"te\":\"\"},{\"en\":\"2. Reporting — Inform the designated Website Nodal Officer and authorised technical support team.\",\"te\":\"\"},{\"en\":\"3. Containment — Take appropriate steps to prevent further damage or unauthorised access.\",\"te\":\"\"},{\"en\":\"4. Escalation — Notify the concerned State IT/hosting agency and other competent authorities as applicable.\",\"te\":\"\"},{\"en\":\"5. Restoration — Restore the website using verified backups and authorised recovery procedures.\",\"te\":\"\"},{\"en\":\"6. Verification — Check the restored website, content integrity and essential services.\",\"te\":\"\"},{\"en\":\"7. Communication — Issue an approved public notice through appropriate official channels if required.\",\"te\":\"\"},{\"en\":\"8. Documentation — Record the incident, response, restoration and preventive measures.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"Responsibilities and recovery\",\"te\":\"బాధ్యతలు మరియు పునరుద్ధరణ\"},\"body\":[{\"en\":\"The Department shall identify and notify the departmental Website Nodal Officer, the authorised website administrator, the hosting/technical support agency, the departmental administrative escalation authority and the relevant cybersecurity response authority as applicable.\",\"te\":\"\"},{\"en\":\"The authorised technical team should maintain appropriate backups and periodically verify that restoration procedures are workable.\",\"te\":\"\"},{\"en\":\"Cybersecurity incidents shall be handled in accordance with applicable Government security instructions and directions of the competent cybersecurity authorities.\",\"te\":\"\"},{\"en\":\"A separate internal contact and escalation directory shall be maintained with verified official contact details. Personal contact details should not be published in the public policy document.\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('pages',21,'{\"subtitle\":{\"en\":\"Basic guidance to access information and navigate the website\",\"te\":\"సమాచారాన్ని యాక్సెస్ చేయడానికి మరియు వెబ్‌సైట్‌ను నావిగేట్ చేయడానికి ప్రాథమిక మార్గదర్శకం\"},\"sections\":[{\"heading\":{\"en\":\"Welcome\",\"te\":\"స్వాగతం\"},\"body\":[{\"en\":\"Welcome to the official website of the Department of Science, Technology & Innovation, Government of Andhra Pradesh. This page provides basic guidance to help visitors access information and navigate the website.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్‌కు స్వాగతం. సందర్శకులు సమాచారాన్ని యాక్సెస్ చేయడానికి మరియు వెబ్‌సైట్‌ను నావిగేట్ చేయడానికి ఈ పేజీ ప్రాథమిక మార్గదర్శకాన్ని అందిస్తుంది.\"}]},{\"heading\":{\"en\":\"1. Finding information\",\"te\":\"1. సమాచారాన్ని కనుగొనడం\"},\"body\":[{\"en\":\"Use the main navigation menu to access About the Department, Leadership and Officers, Organisations, Policies and Government Orders, Programmes and Initiatives, Events and Activities, Media Gallery, District Explorer, and Contact and Feedback.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"2. Searching the website\",\"te\":\"2. వెబ్‌సైట్‌లో వెతకడం\"},\"body\":[{\"en\":\"Use the website search facility, where available, to locate information by entering relevant keywords, document titles or subject names.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"3. Viewing and downloading documents\",\"te\":\"3. పత్రాలను చూడటం మరియు డౌన్‌లోడ్ చేయడం\"},\"body\":[{\"en\":\"Documents may be provided in PDF or other formats. Select the relevant document link to open or download it. A suitable document reader may be required to view certain file formats.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"4. Language\",\"te\":\"4. భాష\"},\"body\":[{\"en\":\"Where available, users may select English or Telugu to access website information.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"5. Accessibility\",\"te\":\"5. సులభ ప్రాప్యత\"},\"body\":[{\"en\":\"Users who face difficulty accessing website content may refer to the Accessibility Statement and contact the designated accessibility support officer.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"6. Feedback and enquiries\",\"te\":\"6. అభిప్రాయాలు మరియు విచారణలు\"},\"body\":[{\"en\":\"For suggestions, feedback or website-related issues, users may use the approved feedback facility or contact the Department through the official contact details displayed on the Contact page.\",\"te\":\"\"}]},{\"heading\":{\"en\":\"7. Technical assistance\",\"te\":\"7. సాంకేతిక సహాయం\"},\"body\":[{\"en\":\"For website-related technical issues, please contact:\",\"te\":\"\"},{\"en\":\"Email: [Approved website support email]\",\"te\":\"\"},{\"en\":\"Phone: [Approved support number]\",\"te\":\"\"},{\"en\":\"Working hours: [To be confirmed]\",\"te\":\"\"}]}]}','2026-11-14 10:51:58'),('policies',1,'{\"file\":\"\",\"sector\":\"Science, Technology & Innovation\",\"year\":2026,\"status\":\"Under formulation\",\"relatedOrgs\":[],\"objectives\":[],\"incentives\":[]}','2026-11-14 10:51:58'),('scienceDays',1,'{\"theme\":\"Scientific discovery, research and scientific temper\"}','2026-11-14 10:51:58'),('scienceDays',2,'{\"theme\":\"Technological achievements and innovation\"}','2026-11-14 10:51:58'),('scienceDays',3,'{\"theme\":\"Space science and India’s space achievements\"}','2026-11-14 10:51:58'),('scienceDays',4,'{\"theme\":\"Science for society and sustainable development\"}','2026-11-14 10:51:58');
/*!40000 ALTER TABLE `cms_extras` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `daily_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_stats` (
  `stat_date` date NOT NULL,
  `total_views` int unsigned NOT NULL DEFAULT '0',
  `unique_visitors` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `daily_stats` WRITE;
/*!40000 ALTER TABLE `daily_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_stats` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `district_institutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `district_institutions` (
  `inst_id` int unsigned NOT NULL AUTO_INCREMENT,
  `district_id` tinyint unsigned NOT NULL,
  `org_id` int unsigned DEFAULT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('institution','research_centre','incubator','park','lab','project','activity') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sector_id` int unsigned DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  `address_en` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`inst_id`),
  KEY `idx_inst_district` (`district_id`),
  KEY `org_id` (`org_id`),
  KEY `sector_id` (`sector_id`),
  CONSTRAINT `district_institutions_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE CASCADE,
  CONSTRAINT `district_institutions_ibfk_2` FOREIGN KEY (`org_id`) REFERENCES `organisations` (`org_id`) ON DELETE SET NULL,
  CONSTRAINT `district_institutions_ibfk_3` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `district_institutions` WRITE;
/*!40000 ALTER TABLE `district_institutions` DISABLE KEYS */;
/*!40000 ALTER TABLE `district_institutions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `district_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `map_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  PRIMARY KEY (`district_id`),
  UNIQUE KEY `name_en` (`name_en`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` (`district_id`, `name_en`, `name_te`, `slug`, `map_code`, `latitude`, `longitude`) VALUES (1,'Srikakulam','శ్రీకాకుళం','srikakulam',NULL,NULL,NULL),(2,'Parvathipuram Manyam','పార్వతీపురం మన్యం','parvathipuram-manyam',NULL,NULL,NULL),(3,'Vizianagaram','విజయనగరం','vizianagaram',NULL,NULL,NULL),(4,'Visakhapatnam','విశాఖపట్నం','visakhapatnam',NULL,NULL,NULL),(5,'Alluri Sitharama Raju','అల్లూరి సీతారామరాజు','alluri-sitharama-raju',NULL,NULL,NULL),(6,'Anakapalli','అనకాపల్లి','anakapalli',NULL,NULL,NULL),(7,'Kakinada','కాకినాడ','kakinada',NULL,NULL,NULL),(8,'East Godavari','తూర్పు గోదావరి','east-godavari',NULL,NULL,NULL),(9,'Dr. B.R. Ambedkar Konaseema','డా. బి.ఆర్. అంబేద్కర్ కోనసీమ','konaseema',NULL,NULL,NULL),(10,'Eluru','ఏలూరు','eluru',NULL,NULL,NULL),(11,'West Godavari','పశ్చిమ గోదావరి','west-godavari',NULL,NULL,NULL),(12,'NTR','ఎన్.టి.ఆర్','ntr',NULL,NULL,NULL),(13,'Krishna','కృష్ణా','krishna',NULL,NULL,NULL),(14,'Palnadu','పల్నాడు','palnadu',NULL,NULL,NULL),(15,'Guntur','గుంటూరు','guntur',NULL,NULL,NULL),(16,'Bapatla','బాపట్ల','bapatla',NULL,NULL,NULL),(17,'Prakasam','ప్రకాశం','prakasam',NULL,NULL,NULL),(18,'Sri Potti Sriramulu Nellore','శ్రీ పొట్టి శ్రీరాములు నెల్లూరు','nellore',NULL,NULL,NULL),(19,'Kurnool','కర్నూలు','kurnool',NULL,NULL,NULL),(20,'Nandyal','నంద్యాల','nandyal',NULL,NULL,NULL),(21,'Anantapuramu','అనంతపురము','anantapuramu',NULL,NULL,NULL),(22,'Sri Sathya Sai','శ్రీ సత్యసాయి','sri-sathya-sai',NULL,NULL,NULL),(23,'YSR Kadapa','వైఎస్ఆర్ కడప','ysr-kadapa',NULL,NULL,NULL),(24,'Annamayya','అన్నమయ్య','annamayya',NULL,NULL,NULL),(25,'Chittoor','చిత్తూరు','chittoor',NULL,NULL,NULL),(26,'Tirupati','తిరుపతి','tirupati',NULL,NULL,NULL),(27,'Markapuram','మార్కాపురం','markapuram',NULL,NULL,NULL),(28,'Polavaram','పోలవరం','polavaram',NULL,NULL,NULL);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `document_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_categories` (
  `category_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `document_categories` WRITE;
/*!40000 ALTER TABLE `document_categories` DISABLE KEYS */;
INSERT INTO `document_categories` (`category_id`, `slug`, `name_en`, `name_te`, `display_order`) VALUES (1,'government-orders','Government Orders',NULL,1),(2,'notifications','Notifications',NULL,2),(3,'circulars','Circulars',NULL,3),(4,'acts','Acts',NULL,4),(5,'rules','Rules',NULL,5),(6,'guidelines','Guidelines',NULL,6),(7,'rti','Right to Information',NULL,7),(8,'it-act-2000','IT Act 2000 (Procedure, Judgements)',NULL,8),(9,'posh-act','PoSH Act',NULL,9);
/*!40000 ALTER TABLE `document_categories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `doc_id` int unsigned NOT NULL AUTO_INCREMENT,
  `category_id` tinyint unsigned NOT NULL,
  `doc_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_en` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  `doc_date` date NOT NULL,
  `policy_id` int unsigned DEFAULT NULL,
  `file_id` int unsigned DEFAULT NULL,
  `download_count` int unsigned NOT NULL DEFAULT '0',
  `status` enum('draft','pending','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `display_order` smallint NOT NULL DEFAULT '0',
  `created_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`doc_id`),
  KEY `idx_doc_cat_date` (`category_id`,`doc_date`),
  KEY `policy_id` (`policy_id`),
  KEY `file_id` (`file_id`),
  KEY `created_by` (`created_by`),
  FULLTEXT KEY `ft_doc_en` (`title_en`,`description_en`,`doc_number`),
  FULLTEXT KEY `ft_doc_te` (`title_te`,`description_te`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`category_id`),
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`policy_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` (`doc_id`, `category_id`, `doc_number`, `title_en`, `title_te`, `description_en`, `description_te`, `doc_date`, `policy_id`, `file_id`, `download_count`, `status`, `display_order`, `created_by`, `created_at`) VALUES (1,1,'G.O.Ms.No.28','Establishment of the Department of Science, Technology & Innovation','విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఏర్పాటు',NULL,NULL,'2026-03-06',NULL,NULL,0,'published',10,NULL,'2026-11-14 10:51:58'),(2,1,'G.O.Ms.No.27','Establishment of AP-FIRST as a Section 8 company','AP-FIRSTను సెక్షన్-8 కంపెనీగా ఏర్పాటు చేయడం',NULL,NULL,'2026-06-29',NULL,NULL,0,'published',20,NULL,'2026-11-14 10:51:58'),(3,1,'G.O.Ms.No.192','Administrative transfer of AP-FIRST to the Department of Science, Technology & Innovation','AP-FIRST పరిపాలనా బదిలీ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖకు',NULL,NULL,'2026-09-17',NULL,NULL,0,'published',30,NULL,'2026-11-14 10:51:58');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `entity_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entity_links` (
  `link_id` int unsigned NOT NULL AUTO_INCREMENT,
  `from_type` enum('organisation','policy','sector') COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_id` int unsigned NOT NULL,
  `to_type` enum('organisation','policy','sector') COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_id` int unsigned NOT NULL,
  `relation_en` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relation_te` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`link_id`),
  UNIQUE KEY `uq_link` (`from_type`,`from_id`,`to_type`,`to_id`),
  KEY `idx_link_to` (`to_type`,`to_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `entity_links` WRITE;
/*!40000 ALTER TABLE `entity_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `entity_links` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` mediumtext COLLATE utf8mb4_unicode_ci,
  `description_te` mediumtext COLLATE utf8mb4_unicode_ci,
  `venue_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district_id` tinyint unsigned DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `registration_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_id` int unsigned DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_event_start` (`start_datetime`),
  KEY `district_id` (`district_id`),
  KEY `banner_id` (`banner_id`),
  FULLTEXT KEY `ft_event` (`title_en`,`description_en`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`) ON DELETE SET NULL,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`banner_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `faq_id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_en` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_te` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_en` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_te` text COLLATE utf8mb4_unicode_ci,
  `display_order` smallint NOT NULL DEFAULT '0',
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`faq_id`),
  FULLTEXT KEY `ft_faq` (`question_en`,`answer_en`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` (`faq_id`, `question_en`, `question_te`, `answer_en`, `answer_te`, `display_order`, `status`) VALUES (1,'What is the Department of Science, Technology & Innovation?','విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అంటే ఏమిటి?','It is a Government of Andhra Pradesh department created through G.O.Ms.No.28, General Administration (Cabinet-II) Department, dated 06.03.2026.','ఇది జీ.ఓ.ఎం.ఎస్. నం.28, సాధారణ పరిపాలన (కేబినెట్-II) శాఖ, తేదీ 06.03.2026 ద్వారా ఏర్పాటు చేయబడిన ఆంధ్రప్రదేశ్ ప్రభుత్వ శాఖ.',10,'published'),(2,'What are the main responsibilities of the Department?','శాఖ ప్రధాన బాధ్యతలు ఏమిటి?','Its subjects include Science & Technology policy, R&D promotion, innovation and start-up ecosystems, technology commercialisation, digital and emerging technologies, and collaboration with national and international research institutions.','విజ్ఞాన శాస్త్రం & సాంకేతిక విధానం, పరిశోధన & అభివృద్ధి ప్రోత్సాహం, ఆవిష్కరణలు మరియు స్టార్టప్ వ్యవస్థలు, సాంకేతిక వాణిజ్యీకరణ, డిజిటల్ మరియు అభివృద్ధి చెందుతున్న సాంకేతికతలు, జాతీయ మరియు అంతర్జాతీయ పరిశోధనా సంస్థలతో సహకారం ఇందులో ఉన్నాయి.',20,'published'),(3,'How can I obtain Government Orders issued by the Department?','శాఖ జారీ చేసిన ప్రభుత్వ ఉత్తర్వులను ఎలా పొందవచ్చు?','Relevant Government Orders and notifications approved for publication will be available in the Government Orders & Documents section of this website.','ప్రచురణకు ఆమోదించబడిన సంబంధిత ప్రభుత్వ ఉత్తర్వులు మరియు నోటిఫికేషన్లు ఈ వెబ్‌సైట్‌లోని ప్రభుత్వ ఉత్తర్వులు & పత్రాలు విభాగంలో అందుబాటులో ఉంటాయి.',30,'published'),(4,'Does the Department provide research grants?','శాఖ పరిశోధన గ్రాంట్లు అందిస్తుందా?','Details of any approved research grant programmes will be published after the Department confirms the scheme guidelines and application process.','ఆమోదించబడిన పరిశోధన గ్రాంట్ కార్యక్రమాల వివరాలు, పథకం మార్గదర్శకాలు మరియు దరఖాస్తు ప్రక్రియను శాఖ ధృవీకరించిన తర్వాత ప్రచురించబడతాయి.',40,'published'),(5,'How can researchers collaborate with the Department?','పరిశోధకులు శాఖతో ఎలా సహకరించవచ్చు?','Researchers and institutions may approach the Department through its officially published contact channels. Specific collaboration procedures will be provided when notified.','పరిశోధకులు మరియు సంస్థలు అధికారికంగా ప్రచురించబడిన సంప్రదింపు మార్గాల ద్వారా శాఖను సంప్రదించవచ్చు. ప్రత్యేక సహకార విధానాలు ప్రకటించినప్పుడు అందించబడతాయి.',50,'published'),(6,'What is AP-FIRST?','AP-FIRST అంటే ఏమిటి?','AP-FIRST is an initiative established to promote research, innovation and technology commercialisation in Andhra Pradesh.','AP-FIRST అనేది ఆంధ్రప్రదేశ్‌లో పరిశోధన, ఆవిష్కరణలు మరియు సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించడానికి ఏర్పాటు చేసిన కార్యక్రమం.',60,'published'),(7,'What are the priority areas of AP-FIRST?','AP-FIRST ప్రాధాన్య రంగాలు ఏమిటి?','They include aerospace and defence, space technologies, AI and cyber security, semiconductors, quantum technologies, healthcare and biotechnology, renewable energy, rural and agricultural technologies, and advanced materials.','ఏరోస్పేస్ మరియు రక్షణ, అంతరిక్ష సాంకేతికతలు, AI మరియు సైబర్ భద్రత, సెమీకండక్టర్లు, క్వాంటం సాంకేతికతలు, ఆరోగ్య సంరక్షణ మరియు బయోటెక్నాలజీ, పునరుత్పాదక ఇంధనం, గ్రామీణ మరియు వ్యవసాయ సాంకేతికతలు, అధునాతన పదార్థాలు ఇందులో ఉన్నాయి.',70,'published'),(8,'How can start-ups seek support?','స్టార్టప్‌లు ఎలా మద్దతు పొందవచ్చు?','Information on applicable approved policies, programmes and implementing organisations will be made available through the relevant website sections.','వర్తించే ఆమోదిత విధానాలు, కార్యక్రమాలు మరియు అమలు సంస్థల సమాచారం వెబ్‌సైట్‌లోని సంబంధిత విభాగాలలో అందుబాటులో ఉంటుంది.',80,'published'),(9,'How can I submit an RTI application?','RTI దరఖాస్తును ఎలా సమర్పించవచ్చు?','Applications may be submitted to the designated Public Information Officer under the RTI Act, 2005. The Department will publish the relevant officer and application details.','RTI చట్టం, 2005 ప్రకారం నియమించబడిన ప్రజా సమాచార అధికారికి దరఖాస్తులు సమర్పించవచ్చు. సంబంధిత అధికారి మరియు దరఖాస్తు వివరాలను శాఖ ప్రచురిస్తుంది.',90,'published'),(10,'Where can I find information about tenders?','టెండర్ల సమాచారం ఎక్కడ దొరుకుతుంది?','Tender notices and related procurement documents approved for publication will be listed in the Tenders section.','ప్రచురణకు ఆమోదించబడిన టెండర్ నోటీసులు మరియు సంబంధిత కొనుగోలు పత్రాలు టెండర్ల విభాగంలో చూపబడతాయి.',100,'published'),(11,'How can I contact the Department?','శాఖను ఎలా సంప్రదించవచ్చు?','The Department’s approved public contact details will be available on the Contact Us page.','శాఖ ఆమోదించిన ప్రజా సంప్రదింపు వివరాలు సంప్రదించండి పేజీలో అందుబాటులో ఉంటాయి.',110,'published'),(12,'How can I find science and technology organisations in Andhra Pradesh?','ఆంధ్రప్రదేశ్‌లో విజ్ఞాన శాస్త్ర మరియు సాంకేతిక సంస్థలను ఎలా కనుగొనవచ్చు?','The website’s Organisations section will provide profiles of organisations officially confirmed under the Department.','వెబ్‌సైట్‌లోని సంస్థల విభాగం, శాఖ పరిధిలో అధికారికంగా ధృవీకరించబడిన సంస్థల ప్రొఫైళ్లను అందిస్తుంది.',120,'published');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_hash` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('new','read','replied','resolved','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `response` text COLLATE utf8mb4_unicode_ci,
  `responded_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `notified_at` datetime DEFAULT NULL,
  `handled_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `handled_by` (`handled_by`),
  KEY `idx_feedback_status` (`status`,`created_at`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`handled_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `jwt_blocklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwt_blocklist` (
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_hash`),
  KEY `idx_jwt_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `jwt_blocklist` WRITE;
/*!40000 ALTER TABLE `jwt_blocklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `jwt_blocklist` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `media_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_files` (
  `file_id` int unsigned NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_kb` int unsigned DEFAULT NULL,
  `alt_text_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` int unsigned DEFAULT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_media_path` (`file_path`(100)),
  CONSTRAINT `media_files_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `media_files` WRITE;
/*!40000 ALTER TABLE `media_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_files` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `news_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news_updates` (
  `news_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title_en` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publish_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_ticker` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`news_id`),
  KEY `created_by` (`created_by`),
  FULLTEXT KEY `ft_news` (`title_en`,`title_te`),
  CONSTRAINT `news_updates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `news_updates` WRITE;
/*!40000 ALTER TABLE `news_updates` DISABLE KEYS */;
INSERT INTO `news_updates` (`news_id`, `title_en`, `title_te`, `link_url`, `publish_date`, `expiry_date`, `is_ticker`, `status`, `created_by`) VALUES (1,'Government Order issued for the creation of the Department of Science, Technology & Innovation','విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఏర్పాటు కోసం ప్రభుత్వ ఉత్తర్వు జారీ','/ecitizen/government-orders','2026-03-06',NULL,1,'published',NULL),(2,'Government Order issued for the establishment of AP-FIRST','AP-FIRST ఏర్పాటు కోసం ప్రభుత్వ ఉత్తర్వు జారీ','/ecitizen/government-orders','2026-06-29',NULL,1,'published',NULL),(3,'AP-FIRST transferred to the Department of Science, Technology & Innovation','AP-FIRST విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖకు బదిలీ','/ecitizen/government-orders','2026-09-17',NULL,1,'published',NULL);
/*!40000 ALTER TABLE `news_updates` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `office_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office_contacts` (
  `contact_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `office_name_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `office_name_te` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_en` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_te` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `working_hours` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `office_contacts` WRITE;
/*!40000 ALTER TABLE `office_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `office_contacts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `officers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `officers` (
  `officer_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation_te` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_id` int unsigned DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`officer_id`),
  KEY `photo_id` (`photo_id`),
  CONSTRAINT `officers_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `officers` WRITE;
/*!40000 ALTER TABLE `officers` DISABLE KEYS */;
INSERT INTO `officers` (`officer_id`, `name_en`, `name_te`, `designation_en`, `designation_te`, `phone`, `email`, `photo_id`, `display_order`, `is_active`) VALUES (1,'Dr. Hanumanthu Purushotham',NULL,'Secretary to Government',NULL,'+91 8632445988','secy-sti@ap.gov.in',NULL,10,1),(2,'To be nominated',NULL,'Web Information Manager / Website Nodal Officer',NULL,'To be provided',NULL,NULL,20,1),(3,'To be nominated',NULL,'Grievance / Feedback Nodal Officer',NULL,'To be provided',NULL,NULL,30,1);
/*!40000 ALTER TABLE `officers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `organisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organisations` (
  `org_id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_en` mediumtext COLLATE utf8mb4_unicode_ci,
  `about_te` mediumtext COLLATE utf8mb4_unicode_ci,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_en` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_id` int unsigned DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`org_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `logo_id` (`logo_id`),
  FULLTEXT KEY `ft_org_en` (`name_en`,`about_en`),
  FULLTEXT KEY `ft_org_te` (`name_te`,`about_te`),
  CONSTRAINT `organisations_ibfk_1` FOREIGN KEY (`logo_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `organisations` WRITE;
/*!40000 ALTER TABLE `organisations` DISABLE KEYS */;
INSERT INTO `organisations` (`org_id`, `slug`, `name_en`, `name_te`, `short_name`, `about_en`, `about_te`, `website_url`, `email`, `phone`, `address_en`, `logo_id`, `display_order`, `status`) VALUES (1,'apcost','Andhra Pradesh State Council of Science & Technology','ఆంధ్రప్రదేశ్ రాష్ట్ర విజ్ఞాన శాస్త్ర మరియు సాంకేతిక మండలి','APCOST','The Andhra Pradesh State Council of Science & Technology (APCOST) is an autonomous organisation of the Government of Andhra Pradesh, established in 1986 to promote science, technology and innovation across the State. It serves as an institutional platform for encouraging scientific research, technological advancement and the application of scientific knowledge to address developmental challenges. APCOST works towards strengthening collaboration among government departments, academic institutions, research organisations and industries. Its activities include promotion of scientific research, science popularisation, support for grassroots innovations, capacity building, research collaboration and technology-driven solutions for sustainable and inclusive development. The Council also facilitates scientific awareness and strengthens the connection between science, society and public policy.','ఆంధ్రప్రదేశ్ రాష్ట్ర విజ్ఞాన శాస్త్ర మరియు సాంకేతిక మండలి (APCOST) ఆంధ్రప్రదేశ్ ప్రభుత్వానికి చెందిన స్వయంప్రతిపత్తి సంస్థ. రాష్ట్రవ్యాప్తంగా విజ్ఞాన శాస్త్రం, సాంకేతికత మరియు ఆవిష్కరణలను ప్రోత్సహించాలనే లక్ష్యంతో 1986లో ఈ సంస్థ ఏర్పాటు చేయబడింది. శాస్త్రీయ పరిశోధన, సాంకేతిక అభివృద్ధి మరియు అభివృద్ధి సంబంధిత సవాళ్ల పరిష్కారానికి శాస్త్రీయ జ్ఞాన వినియోగాన్ని ప్రోత్సహించడంలో ఇది కీలక వేదికగా పనిచేస్తుంది. ప్రభుత్వ శాఖలు, విద్యాసంస్థలు, పరిశోధనా సంస్థలు మరియు పరిశ్రమల మధ్య సహకారాన్ని బలోపేతం చేయడానికి APCOST కృషి చేస్తుంది. శాస్త్రీయ పరిశోధన ప్రోత్సాహం, విజ్ఞాన ప్రచారం, స్థూల స్థాయి ఆవిష్కరణలకు మద్దతు, సామర్థ్య నిర్మాణం, పరిశోధనా సహకారం మరియు సుస్థిర, సమగ్ర అభివృద్ధి కోసం సాంకేతిక పరిష్కారాలను ఇది నిర్వహిస్తుంది. శాస్త్రీయ అవగాహనను ప్రోత్సహించడం మరియు విజ్ఞానం, సమాజం, ప్రజావిధానాల మధ్య సంబంధాన్ని బలోపేతం చేయడం కూడా ఈ మండలి కార్యక్రమాలలో భాగం.','https://apcost.ap.gov.in/',NULL,NULL,NULL,NULL,10,'published'),(2,'scap','Science City of Andhra Pradesh','ఆంధ్రప్రదేశ్ విజ్ఞాన నగరం','SCAP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,20,'published'),(3,'apsta','Andhra Pradesh Science and Technology Academy','ఆంధ్రప్రదేశ్ విజ్ఞాన శాస్త్ర మరియు సాంకేతిక అకాడమీ','APSTA',NULL,NULL,NULL,NULL,NULL,NULL,NULL,30,'published'),(4,'ap-first','Andhra Pradesh Future Innovation, Research, Science and Technology','ఆంధ్రప్రదేశ్ ఫ్యూచర్ ఇన్నోవేషన్, రీసెర్చ్, సైన్స్ అండ్ టెక్నాలజీ','AP-FIRST','AP-FIRST was established by the Government of Andhra Pradesh through G.O.Ms.No.27, Environment & Forests (SEC.V) Department, dated 29.06.2026, as a Section 8 company to promote research, innovation and technology commercialisation in the State. It focuses on nine priority domains, including aerospace and defence, space technologies, artificial intelligence and cyber security, semiconductors, quantum technologies, healthcare and biotechnology, renewable energy, rural and agricultural technologies, and advanced materials. Administrative control was subsequently transferred to DST&I through G.O.Ms.No.192, General Administration (Cabinet-II) Department, dated 17.09.2026. The initial Government seed capital for the company is ₹5 crore.','రాష్ట్రంలో పరిశోధన, ఆవిష్కరణలు మరియు సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించేందుకు ప్రభుత్వం G.O.Ms.No.27, Environment & Forests (SEC.V) Department, తేదీ 29.06.2026 ద్వారా AP-FIRSTను సెక్షన్-8 కంపెనీగా ఏర్పాటు చేసింది. ఏరోస్పేస్ మరియు రక్షణ, అంతరిక్ష సాంకేతికతలు, కృత్రిమ మేధస్సు మరియు సైబర్ భద్రత, సెమీకండక్టర్లు, క్వాంటం సాంకేతికతలు, ఆరోగ్య సంరక్షణ మరియు బయోటెక్నాలజీ, పునరుత్పాదక ఇంధనం, గ్రామీణ మరియు వ్యవసాయ సాంకేతికతలు, అధునాతన పదార్థాలు వంటి తొమ్మిది ప్రాధాన్య రంగాలపై ఈ కార్యక్రమం కృషి చేస్తుంది. G.O.Ms.No.192, General Administration (Cabinet-II) Department, తేదీ 17.09.2026 ద్వారా దీని పరిపాలనా నియంత్రణ DST&I శాఖకు బదిలీ చేయబడింది. కంపెనీకి ప్రభుత్వ ప్రారంభ విత్తన మూలధనం ₹5 కోట్లు.',NULL,NULL,NULL,NULL,NULL,40,'published');
/*!40000 ALTER TABLE `organisations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `page_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_views` (
  `view_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_path` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lang` enum('en','te') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `visitor_hash` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('mobile','tablet','desktop','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`view_id`),
  KEY `idx_view_date` (`viewed_at`),
  KEY `idx_view_path` (`page_path`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `page_views` WRITE;
/*!40000 ALTER TABLE `page_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_views` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `page_id` int unsigned NOT NULL AUTO_INCREMENT,
  `parent_page_id` int unsigned DEFAULT NULL,
  `section` enum('home','about','ict','investor','ecitizen','media','contact','statutory') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'about',
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_en` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_te` mediumtext COLLATE utf8mb4_unicode_ci,
  `meta_desc_en` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_desc_te` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_image_id` int unsigned DEFAULT NULL,
  `show_in_footer` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` smallint NOT NULL DEFAULT '0',
  `status` enum('draft','pending','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` int unsigned DEFAULT NULL,
  `updated_by` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`page_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_page_id` (`parent_page_id`),
  KEY `og_image_id` (`og_image_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  FULLTEXT KEY `ft_pages_en` (`title_en`,`body_en`),
  FULLTEXT KEY `ft_pages_te` (`title_te`,`body_te`),
  CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`parent_page_id`) REFERENCES `pages` (`page_id`) ON DELETE SET NULL,
  CONSTRAINT `pages_ibfk_2` FOREIGN KEY (`og_image_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `pages_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `pages_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` (`page_id`, `parent_page_id`, `section`, `slug`, `title_en`, `title_te`, `body_en`, `body_te`, `meta_desc_en`, `meta_desc_te`, `og_image_id`, `show_in_footer`, `display_order`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES (1,NULL,'about','introduction','About the Department','శాఖ పరిచయం','The Department of Science, Technology & Innovation (DST&I), Government of Andhra Pradesh, is entrusted with promoting scientific advancement, technological development, research and innovation across the State. The Department aims to strengthen Andhra Pradesh’s scientific and technological ecosystem by facilitating research, encouraging innovation, promoting technology adoption and fostering collaboration among government departments, academic institutions, research organisations, industries and other stakeholders.\n\nThe Department was established through G.O.Ms.No.28, General Administration (Cabinet-II) Department, dated 06.03.2026, with the objective of providing focused administrative direction and coordination for Science, Technology & Innovation-related activities in Andhra Pradesh.\n\nThe Department seeks to create an enabling environment for scientific research, development and innovation by supporting research institutions, universities, scientific organisations, technology-driven enterprises and innovation ecosystems. It works towards promoting research and development (R&D), facilitating the translation of scientific discoveries into practical applications, encouraging technology commercialisation and strengthening linkages between academia, industry and government.\n\nIts areas of focus include the promotion of science and scientific temper, emerging and advanced technologies, information technology, electronics, space technology and applications, innovation, research and development, start-up ecosystems and technology-led solutions for governance and public service delivery. The Department also seeks to encourage the adoption of emerging technologies and facilitate partnerships with national and international research institutions, industries and knowledge organisations.\n\nThrough coordination with institutions and organisations associated with science, technology and innovation, the Department aims to strengthen research infrastructure, promote scientific awareness, support innovation-driven initiatives and facilitate the development of technology-based solutions to address societal and developmental challenges.\n\nThe Department envisions positioning Andhra Pradesh as a leading destination for scientific research, technological advancement and innovation, contributing to sustainable economic growth, employment generation, improved public services and the State’s long-term development vision of Swarna Andhra Pradesh @ 2047.','ఆంధ్రప్రదేశ్ ప్రభుత్వంలోని విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ (DST&I), రాష్ట్రవ్యాప్తంగా శాస్త్రీయ పురోగతి, సాంకేతిక అభివృద్ధి, పరిశోధన మరియు ఆవిష్కరణలను ప్రోత్సహించే బాధ్యతను నిర్వహిస్తుంది. పరిశోధనను సులభతరం చేయడం, ఆవిష్కరణలను ప్రోత్సహించడం, సాంకేతిక వినియోగాన్ని పెంచడం మరియు ప్రభుత్వ శాఖలు, విద్యాసంస్థలు, పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు ఇతర భాగస్వాముల మధ్య సహకారాన్ని పెంపొందించడం ద్వారా ఆంధ్రప్రదేశ్ శాస్త్రీయ, సాంకేతిక పర్యావరణ వ్యవస్థను బలోపేతం చేయడం ఈ శాఖ లక్ష్యం.\n\nసాధారణ పరిపాలన (కేబినెట్-II) శాఖ జారీ చేసిన జీ.ఓ.ఎం.ఎస్. నం.28, తేదీ 06.03.2026 ద్వారా, ఆంధ్రప్రదేశ్‌లో విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన కార్యకలాపాలకు కేంద్రీకృత పరిపాలనా దిశానిర్దేశం మరియు సమన్వయం కల్పించే లక్ష్యంతో ఈ శాఖ ఏర్పాటు చేయబడింది.\n\nపరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, శాస్త్రీయ సంస్థలు, సాంకేతిక ఆధారిత సంస్థలు మరియు ఆవిష్కరణ పర్యావరణ వ్యవస్థలకు మద్దతు అందించడం ద్వారా శాస్త్రీయ పరిశోధన, అభివృద్ధి మరియు ఆవిష్కరణలకు అనుకూలమైన వాతావరణాన్ని సృష్టించడం ఈ శాఖ లక్ష్యం. పరిశోధన మరియు అభివృద్ధిని (R&D) ప్రోత్సహించడం, శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలుగా మార్చడాన్ని సులభతరం చేయడం, సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించడం మరియు విద్యాసంస్థలు, పరిశ్రమలు, ప్రభుత్వాల మధ్య సంబంధాలను బలోపేతం చేయడం కోసం ఇది కృషి చేస్తుంది.\n\nశాస్త్రీయ దృక్పథం మరియు విజ్ఞాన ప్రచారం, అభివృద్ధి చెందుతున్న మరియు ఆధునిక సాంకేతికతలు, సమాచార సాంకేతికత, ఎలక్ట్రానిక్స్, అంతరిక్ష సాంకేతికత మరియు అనువర్తనాలు, ఆవిష్కరణలు, పరిశోధన మరియు అభివృద్ధి, స్టార్టప్ పర్యావరణ వ్యవస్థలు మరియు పరిపాలన, ప్రజా సేవలలో సాంకేతిక ఆధారిత పరిష్కారాలు ఈ శాఖ దృష్టి కేంద్రాలలో ఉన్నాయి. అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం మరియు జాతీయ, అంతర్జాతీయ పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు విజ్ఞాన సంస్థలతో భాగస్వామ్యాలను సులభతరం చేయడం కూడా ఈ శాఖ లక్ష్యం.\n\nవిజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన సంస్థలతో సమన్వయం ద్వారా, పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, శాస్త్రీయ అవగాహనను ప్రోత్సహించడం, ఆవిష్కరణ ఆధారిత కార్యక్రమాలకు మద్దతు అందించడం మరియు సామాజిక, అభివృద్ధి సవాళ్లను పరిష్కరించడానికి సాంకేతిక ఆధారిత పరిష్కారాలను అభివృద్ధి చేయడం ఈ శాఖ లక్ష్యం.\n\nశాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలకు ఆంధ్రప్రదేశ్‌ను ప్రముఖ గమ్యస్థానంగా నిలపడం, సుస్థిర ఆర్థిక వృద్ధి, ఉపాధి కల్పన, మెరుగైన ప్రజా సేవలు మరియు స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 దీర్ఘకాలిక అభివృద్ధి లక్ష్యానికి దోహదపడటం ఈ శాఖ ఆకాంక్ష.',NULL,NULL,NULL,0,10,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(2,NULL,'about','mission','Vision & Mission','దృష్టి & లక్ష్యం','To position Andhra Pradesh as a leading national and global hub for scientific research, technological advancement and innovation, fostering a knowledge-driven and innovation-led economy in alignment with the vision of Swarna Andhra Pradesh @ 2047.\n\nTo promote scientific research, technological development and innovation through effective policies, institutional coordination and strategic partnerships. To strengthen research infrastructure, encourage collaboration among academia, industry and government, facilitate technology transfer and commercialisation, and support the adoption of emerging technologies for sustainable development and improved quality of life in Andhra Pradesh.','స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 లక్ష్యానికి అనుగుణంగా, శాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలలో ఆంధ్రప్రదేశ్‌ను జాతీయ మరియు అంతర్జాతీయ ప్రముఖ కేంద్రంగా నిలపడం, విజ్ఞాన ఆధారిత మరియు ఆవిష్కరణ ఆధారిత ఆర్థిక వ్యవస్థను అభివృద్ధి చేయడం.\n\nసమర్థవంతమైన విధానాలు, సంస్థాగత సమన్వయం మరియు వ్యూహాత్మక భాగస్వామ్యాల ద్వారా శాస్త్రీయ పరిశోధన, సాంకేతిక అభివృద్ధి మరియు ఆవిష్కరణలను ప్రోత్సహించడం. పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారాన్ని ప్రోత్సహించడం, సాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం, ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి మరియు మెరుగైన జీవన ప్రమాణాల కోసం అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం.',NULL,NULL,NULL,0,20,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(3,NULL,'about','objectives','Objectives','లక్ష్యాలు','Promote Scientific Research and Development: Encourage and facilitate scientific research and R&D activities across universities, research institutions and other eligible organisations in Andhra Pradesh.\n\nStrengthen Research Infrastructure: Support the development, modernisation and effective utilisation of scientific laboratories, research facilities, testing centres and advanced technological infrastructure.\n\nFoster Innovation and Entrepreneurship: Promote innovation ecosystems, technology incubation, start-ups and entrepreneurship by facilitating collaboration between academia, industry and government.\n\nAdvance Emerging Technologies: Encourage the adoption, development and application of emerging and advanced technologies, including Artificial Intelligence, Quantum Technologies, Space Technology, Electronics and other frontier technologies.\n\nFacilitate Technology Transfer and Commercialisation: Promote the conversion of research outcomes and scientific discoveries into practical applications, products, services and commercially viable technologies.\n\nPromote Scientific Temper and Awareness: Encourage scientific awareness, research orientation and science outreach activities among students, youth, educational institutions and the general public.\n\nStrengthen Institutional and Strategic Partnerships: Facilitate collaboration with national and international research institutions, universities, industries, government agencies and scientific organisations.\n\nLeverage Science and Technology for Development: Promote the application of science, technology and innovation to address societal challenges, improve public service delivery, generate employment and support sustainable development in Andhra Pradesh.','శాస్త్రీయ పరిశోధన మరియు అభివృద్ధిని ప్రోత్సహించడం: ఆంధ్రప్రదేశ్‌లోని విశ్వవిద్యాలయాలు, పరిశోధనా సంస్థలు మరియు ఇతర అర్హత కలిగిన సంస్థలలో శాస్త్రీయ పరిశోధన మరియు పరిశోధన–అభివృద్ధి కార్యకలాపాలను ప్రోత్సహించడం.\n\nపరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం: శాస్త్రీయ ప్రయోగశాలలు, పరిశోధనా కేంద్రాలు, పరీక్షా కేంద్రాలు మరియు ఆధునిక సాంకేతిక మౌలిక సదుపాయాల అభివృద్ధి, ఆధునీకరణ మరియు సమర్థవంతమైన వినియోగానికి తోడ్పడటం.\n\nఆవిష్కరణలు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం: విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారం ద్వారా ఆవిష్కరణ వ్యవస్థలు, సాంకేతిక ఇంక్యుబేషన్ కేంద్రాలు, స్టార్టప్‌లు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం.\n\nఅభివృద్ధి చెందుతున్న సాంకేతికతలను ప్రోత్సహించడం: కృత్రిమ మేధస్సు (AI), క్వాంటం సాంకేతికతలు, అంతరిక్ష సాంకేతికత, ఎలక్ట్రానిక్స్ మరియు ఇతర ఆధునిక సాంకేతిక రంగాల అభివృద్ధి, ప్రవేశం మరియు అనువర్తనాలను ప్రోత్సహించడం.\n\nసాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం: పరిశోధన ఫలితాలు మరియు శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలు, ఉత్పత్తులు, సేవలు మరియు వాణిజ్యపరంగా ఉపయోగపడే సాంకేతికతలుగా మార్చడాన్ని ప్రోత్సహించడం.\n\nశాస్త్రీయ దృక్పథం మరియు అవగాహనను పెంపొందించడం: విద్యార్థులు, యువత, విద్యాసంస్థలు మరియు సాధారణ ప్రజలలో శాస్త్రీయ అవగాహన, పరిశోధనా ఆసక్తి మరియు విజ్ఞాన ప్రచార కార్యక్రమాలను ప్రోత్సహించడం.\n\nసంస్థాగత మరియు వ్యూహాత్మక భాగస్వామ్యాలను బలోపేతం చేయడం: జాతీయ మరియు అంతర్జాతీయ పరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, పరిశ్రమలు, ప్రభుత్వ సంస్థలు మరియు శాస్త్రీయ సంస్థలతో సహకారాన్ని ప్రోత్సహించడం.\n\nఅభివృద్ధి కోసం విజ్ఞాన శాస్త్రం మరియు సాంకేతికతను వినియోగించడం: సామాజిక సవాళ్ల పరిష్కారం, ప్రజా సేవల మెరుగుదల, ఉపాధి కల్పన మరియు ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి కోసం విజ్ఞాన శాస్త్రం, సాంకేతికత మరియు ఆవిష్కరణల అనువర్తనాలను ప్రోత్సహించడం.',NULL,NULL,NULL,0,30,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(4,NULL,'about','ecitizen','Citizen Services (e-Citizen) & Documents','పౌర సేవలు (ఇ-పౌరుడు) & పత్రాలు','Government Orders, notifications, circulars, acts, rules and guidelines approved for publication by the Department are listed in this section.\n\nAt present, the Department of Science, Technology & Innovation does not operate any standalone citizen-facing e-Governance services, online application systems or mobile applications.','ప్రచురణకు ఆమోదించబడిన ప్రభుత్వ ఉత్తర్వులు, నోటిఫికేషన్లు, సర్క్యులర్లు, చట్టాలు, నియమాలు మరియు మార్గదర్శకాలు ఈ విభాగంలో జాబితా చేయబడతాయి.\n\nప్రస్తుతం విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఎటువంటి ప్రత్యేక పౌర-కేంద్రిత ఇ-గవర్నెన్స్ సేవలు, ఆన్‌లైన్ దరఖాస్తు వ్యవస్థలు లేదా మొబైల్ అనువర్తనాలను నిర్వహించడం లేదు.',NULL,NULL,NULL,0,40,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(5,NULL,'about','rti','Right to Information','సమాచార హక్కు','Under the Right to Information Act, 2005, any citizen may request information held by the Department by applying to the Public Information Officer along with the prescribed fee.\n\nThe details of the Public Information Officer and Assistant Public Information Officers will be published after nomination by the Department.\n\nThe First Appellate Authority under the Right to Information Act, 2005 will be published after notification.\n\nInformation disclosed proactively under Section 4(1)(b) of the Right to Information Act, 2005 will be published in this section.\n\nApplications may be submitted to the designated Public Information Officer under the Right to Information Act, 2005. The Department will publish the relevant officer and application details.\n\nThe annual returns of the Department under the Right to Information Act, 2005 will be published here.','సమాచార హక్కు చట్టం, 2005 ప్రకారం, ఏ పౌరుడైనా నిర్దేశిత రుసుముతో ప్రజా సమాచార అధికారికి దరఖాస్తు చేసి శాఖ వద్ద ఉన్న సమాచారాన్ని అభ్యర్థించవచ్చు.\n\nప్రజా సమాచార అధికారి మరియు సహాయ ప్రజా సమాచార అధికారుల వివరాలు శాఖ నియమించిన తర్వాత ప్రచురించబడతాయి.\n\nసమాచార హక్కు చట్టం, 2005 ప్రకారం మొదటి అప్పీల్ అధికారి వివరాలు ప్రకటన తర్వాత ప్రచురించబడతాయి.\n\nసమాచార హక్కు చట్టం, 2005 లోని సెక్షన్ 4(1)(b) ప్రకారం ప్రత్యేకంగా వెల్లడించే సమాచారం ఈ విభాగంలో ప్రచురించబడుతుంది.\n\nసమాచార హక్కు చట్టం, 2005 ప్రకారం నియమించబడిన ప్రజా సమాచార అధికారికి దరఖాస్తులు సమర్పించవచ్చు. సంబంధిత అధికారి మరియు దరఖాస్తు వివరాలను శాఖ ప్రచురిస్తుంది.\n\nసమాచార హక్కు చట్టం, 2005 ప్రకారం శాఖ వార్షిక నివేదికలు ఇక్కడ ప్రచురించబడతాయి.',NULL,NULL,NULL,0,50,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(6,NULL,'about','it-act-2000','Information Technology Act, 2000','సమాచార సాంకేతిక చట్టం, 2000','Statutory information and documents relating to the Information Technology Act, 2000 will be published in this section after approval by the Department.','సమాచార సాంకేతిక చట్టం, 2000 కి సంబంధించిన చట్టబద్ధ సమాచారం మరియు పత్రాలు శాఖ ఆమోదం తర్వాత ఈ విభాగంలో ప్రచురించబడతాయి.',NULL,NULL,NULL,0,60,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(7,NULL,'about','posh-act','PoSH Act – Internal Complaints Committee','PoSH చట్టం – అంతర్గత ఫిర్యాదుల కమిటీ','The constitution and contact details of the Internal Complaints Committee will be published after notification by the Department.','అంతర్గత ఫిర్యాదుల కమిటీ ఏర్పాటు మరియు సంప్రదింపు వివరాలు శాఖ ప్రకటన తర్వాత ప్రచురించబడతాయి.',NULL,NULL,NULL,0,70,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(8,NULL,'about','citizen-charter','Citizen’s Charter','పౌర చార్టర్','The Citizen’s Charter of the Department, setting out the services offered and the standards of service delivery, will be published after approval by the competent authority.','శాఖ అందించే సేవలు మరియు సేవా ప్రమాణాలను వివరించే పౌర చార్టర్, సంబంధిత అధికారి ఆమోదం తర్వాత ప్రచురించబడుతుంది.',NULL,NULL,NULL,0,80,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(9,NULL,'about','website-policy','Website Policy','వెబ్‌సైట్ విధానం','The official website of the Department of Science, Technology & Innovation, Government of Andhra Pradesh, is intended to provide citizens, researchers, students, academic institutions, industries, investors and other stakeholders with information about the Department, its functions, initiatives, policies, organisations, programmes and activities.\n\n1. The website shall publish information relating to the Department’s approved functions, activities, policies, programmes, notifications and public communications.\n\n2. Content shall be reviewed and approved by the designated departmental authority before publication.\n\n3. Information shall be presented in clear, accurate and accessible language, in English and Telugu wherever applicable.\n\n4. Government Orders, official notifications and other authoritative records shall be treated as the primary sources for official decisions and instructions.\n\n5. Information shall be updated when changes are communicated by the concerned sections or competent authorities.\n\nThe Department shall make reasonable efforts to ensure that the website remains accessible. The website may be temporarily unavailable due to maintenance, technical issues, security incidents or circumstances beyond the Department’s control.\n\nThe website shall be developed and maintained with the objective of providing accessible information and services in accordance with applicable Government of India guidelines and accessibility standards.\n\nLinks to external websites may be provided for the convenience of users. The Department does not control the content, availability or privacy practices of external websites.\n\nPersonal information submitted through website forms, if any, shall be handled in accordance with the approved Privacy Policy and applicable rules. Technical and administrative safeguards shall be followed to protect website information and services.\n\nFor website-related queries, users may contact:\n\nDepartment: Department of Science, Technology & Innovation, Government of Andhra Pradesh\n\nEmail: [Approved website support email]\n\nPhone: [Approved website support contact]','ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్, శాఖ, దాని విధులు, కార్యక్రమాలు, విధానాలు, సంస్థలు మరియు కార్యకలాపాల సమాచారాన్ని పౌరులు, పరిశోధకులు, విద్యార్థులు, విద్యాసంస్థలు, పరిశ్రమలు మరియు పెట్టుబడిదారులకు అందించడానికి ఉద్దేశించబడింది.\n\nఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్ ద్వారా శాఖకు సంబంధించిన విధానాలు, కార్యక్రమాలు, ఉత్తర్వులు, సంస్థలు మరియు కార్యకలాపాల సమాచారాన్ని ప్రజలకు అందించడం ఈ వెబ్‌సైట్ ప్రధాన ఉద్దేశ్యం. వెబ్‌సైట్‌లో ప్రచురించే సమాచారం సంబంధిత శాఖాధికారుల పరిశీలన మరియు ఆమోదం అనంతరం అందుబాటులో ఉంచబడుతుంది.',NULL,NULL,NULL,1,90,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(10,NULL,'about','copyright','Copyright Policy','కాపీరైట్ విధానం','Unless otherwise specified, the content published on this website is owned, held or controlled by the Government of Andhra Pradesh or the respective content owner.\n\nUsers may reproduce or reuse website content for lawful, non-commercial and informational purposes, subject to the following conditions:\n\n1. The source and Department shall be appropriately acknowledged.\n\n2. The content shall not be presented in a misleading or distorted manner.\n\n3. Reuse shall not imply endorsement by the Department or the Government of Andhra Pradesh.\n\n4. Third-party content, photographs, illustrations, logos and other material shall not be reproduced without obtaining the necessary permission from the respective rights holder.\n\n5. The State Emblem, Government logos, Department identity marks and official seals shall not be used without the required authorisation.\n\n6. Commercial reproduction or other restricted use shall require prior written permission from the competent authority or rights holder.\n\nWhere a specific copyright notice or licence is displayed against any content, that notice shall prevail.','ఈ వెబ్‌సైట్‌లోని సమాచారాన్ని చటబద్ధమైన, వాణిజ్యేతర మరియు సమాచార ప్రయోజనాల కోసం ఉపయోగించవచ్చు; అయితే మూలాన్ని మరియు శాఖను తగిన విధంగా పేర్కొనాలి. మూడవ పక్షానికి చెందిన చిత్రాలు, లోగోలు మరియు ఇతర సమాచారాన్ని సంబంధిత హక్కుదారుల అనుమతి లేకుండా పునరుత్పత్తి చేయకూడదు.',NULL,NULL,NULL,1,100,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(11,NULL,'about','hyperlink-policy','Hyperlink Policy','హైపర్‌లింక్ విధానం','The Department’s website may contain links to other Government departments, public institutions, academic organisations, research institutions and external websites for the convenience of users.\n\nExternal links are provided for information and reference.\n\nThe presence of a link shall not be interpreted as an endorsement of the linked website, its organisation, products or services.\n\nThe Department does not control the content, accuracy, availability or privacy practices of external websites.\n\nUsers are advised to review the terms and privacy policies of external websites before using them.\n\nOther websites wishing to provide links to the Department’s website should:\n\n1. Link directly to the relevant publicly accessible page.\n\n2. Ensure that the link does not misrepresent the Department or the Government of Andhra Pradesh.\n\n3. Not use the Department’s name, official logo, State Emblem or other official identity elements in a manner that suggests endorsement or affiliation without permission.\n\n4. Not display the Department’s website within another website’s frame in a way that misrepresents its ownership or origin.\n\nThe Department reserves the right to request the removal of links that are misleading, unauthorised or inconsistent with Government policy.',NULL,NULL,NULL,NULL,1,110,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(12,NULL,'about','privacy-policy','Privacy Policy','గోప్యతా విధానం','The Department of Science, Technology & Innovation respects the privacy of visitors to its official website. This policy explains how personal information may be collected, used and protected when users access the website or submit information through its online forms.\n\nWhere an online feedback or enquiry facility is enabled, the website may collect information such as name, email address, contact number if requested, subject or category of enquiry, the feedback or message submitted by the user, and attachments if the facility is provided.\n\nOnly information necessary for the stated purpose should be requested.\n\n1. Respond to enquiries and feedback.\n\n2. Forward requests to the concerned departmental section or authority.\n\n3. Maintain records of communications received.\n\n4. Improve website information and public communication.\n\n5. Protect the website and its services against misuse, where technically applicable.\n\nPersonal information shall be accessed only by authorised personnel for official purposes. It shall not be disclosed to unauthorised parties, except where disclosure is required or permitted under applicable law, Government instructions or lawful directions of a competent authority.\n\nInformation shall be retained in accordance with applicable Government record-retention requirements and the approved departmental retention schedule. A specific retention period shall be published only after it is formally determined.\n\nReasonable administrative and technical safeguards shall be adopted to protect information submitted through the website. Users should avoid submitting passwords, financial details or other sensitive personal information through general feedback forms.\n\nDetails of cookies, analytics, hosting services and other third-party technical services shall be disclosed after the website’s actual technical configuration has been verified. No specific tracking or analytics practice is asserted in this draft.\n\nFor privacy-related questions, users may contact:\n\nDesignated officer: [To be nominated]\n\nEmail: [Approved privacy contact email]\n\nAddress: Department of Science, Technology & Innovation, Government of Andhra Pradesh, AP Secretariat, Velagapudi, Amaravati, Andhra Pradesh.',NULL,NULL,NULL,NULL,1,120,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(13,NULL,'about','terms-of-use','Terms of Use','ఉపయోగ నిబంధనలు','The Department of Science, Technology & Innovation, Government of Andhra Pradesh, provides this website to facilitate public access to information relating to its functions, activities, policies, organisations and initiatives.\n\nUsers shall not misuse the website, attempt unauthorised access, interfere with its operation or use its content for unlawful or misleading purposes.\n\nUnless a specific online service or submission facility is expressly provided, information displayed on this website shall not be treated as an electronic application, official submission or acknowledgement to the Department.\n\nThese terms may be revised from time to time, subject to approval by the competent authority.',NULL,NULL,NULL,NULL,1,130,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(14,NULL,'about','disclaimer','Disclaimer','నిరాకరణ','The Department makes reasonable efforts to ensure that the information published on this website is accurate and current. However, users are advised to verify important information with the concerned authority before relying on it for official or legal purposes.\n\nWhere information on this website differs from an applicable Government Order, notification, statutory instrument or other authoritative official document, the relevant official document shall prevail.\n\nThis website may provide links to external websites. The Department is not responsible for the content, accuracy, availability or practices of those websites.\n\nThe Department does not guarantee uninterrupted access to the website. Access may be affected by maintenance, technical failures, network interruptions or other circumstances.',NULL,NULL,NULL,NULL,1,140,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(15,NULL,'about','accessibility-statement','Accessibility Statement','ప్రాప్యత ప్రకటన','The Department of Science, Technology & Innovation, Government of Andhra Pradesh, is committed to improving the accessibility and usability of its official website so that information can be accessed by all users, including persons with disabilities.\n\nThe Department proposes to develop and maintain the website in accordance with the applicable Guidelines for Indian Government Websites (GIGW 3.0) and the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.\n\nText alternatives for meaningful images and visual content.\n\nClear headings and logical page structure.\n\nKeyboard-accessible navigation and controls.\n\nAdequate colour contrast and readable text.\n\nCaptions or transcripts for relevant audio and video content.\n\nAccessible document formats wherever practicable.\n\nClear labels and instructions for online forms.\n\nEnglish and Telugu content wherever applicable.\n\nUsers experiencing difficulty accessing information on the website may report the issue through:\n\nEmail: [Approved accessibility contact email]\n\nPhone: [Approved accessibility contact number]\n\nContact person/designation: [To be nominated]\n\nThe Department shall examine accessibility-related feedback and take appropriate corrective action, subject to technical feasibility and applicable guidelines.',NULL,NULL,NULL,NULL,1,150,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(16,NULL,'about','screen-reader-access','Screen Reader Access','స్క్రీన్ రీడర్ ప్రాప్యత','The website is designed to be used with screen reader software. Keyboard-accessible navigation, clear headings, logical page structure and text alternatives for meaningful images are provided.\n\nWhere available, users may select English or Telugu to access website information.\n\nUsers who face difficulty accessing website content may refer to the Accessibility Statement and contact the designated accessibility support officer through the contact details published on the Contact page.','స్క్రీన్ రీడర్ సాఫ్ట్‌వేర్‌తో ఉపయోగించడానికి వెబ్‌సైట్ రూపొందించబడింది. కీబోర్డ్ ద్వారా నావిగేషన్, స్పష్టమైన శీర్షికలు, క్రమబద్ధమైన పేజీ నిర్మాణం మరియు చిత్రాలకు ప్రత్యామ్నాయ వచనం అందించబడతాయి.\n\nఅందుబాటులో ఉన్న చోట, వెబ్‌సైట్ సమాచారాన్ని యాక్సెస్ చేయడానికి వినియోగదారులు ఇంగ్లీష్ లేదా తెలుగును ఎంచుకోవచ్చు.',NULL,NULL,NULL,0,160,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(17,NULL,'about','cmap','Content Moderation and Approval Policy (CMAP)','కంటెంట్ మోడరేషన్ మరియు ఆమోద విధానం (CMAP)','To establish a clear process for creating, reviewing, approving, publishing and updating information on the official website of the Department.\n\nContent Originating Section — Prepare and submit accurate information and supporting documents.\n\nSection-level Verifying Officer — Verify facts, dates, designations, references and attachments.\n\nDesignated Approving Authority — Approve content for publication.\n\nWebsite Nodal Officer — Coordinate content submission, review and publication.\n\nWebsite Administrator / Technical Team — Upload approved content and maintain website functionality.\n\nThe names and official designations of the responsible officers shall be notified separately.\n\n1. The concerned section prepares the content.\n\n2. The content is checked against official records and supporting documents.\n\n3. The authorised officer verifies the content.\n\n4. Approval is obtained from the competent authority.\n\n5. The approved content is forwarded to the Website Nodal Officer or authorised publisher.\n\n6. The website administrator publishes the content.\n\n7. The publication date, approving authority and revision details are recorded.\n\nAll website content should be factually accurate and supported by official records; use approved names, designations, dates and Government Order references; follow the Department’s approved terminology and communication standards; avoid unauthorised personal information or confidential material; use photographs and media for which the necessary permissions have been obtained; and be available in accessible formats wherever practicable.\n\nCorrections shall be routed through the concerned section and approving authority. Urgent changes, including security-related notices or critical public information, shall follow an expedited approval process authorised by the Department.\n\nThe Department should maintain records of submitted content, approvals, publication dates, revisions and removal or archival decisions.',NULL,NULL,NULL,NULL,0,170,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(18,NULL,'about','cap','Content Archival Policy (CAP)','కంటెంట్ ఆర్కైవ్ విధానం (CAP)','To ensure that outdated, superseded or no-longer-current website content is reviewed and archived systematically, while preserving access to important Government information.\n\n1. Current and valid information shall remain available in the relevant website section.\n\n2. Superseded content shall be clearly marked as archived or superseded.\n\n3. Archived Government Orders, policies and official documents should remain accessible where permitted by applicable rules.\n\n4. Content shall not be permanently deleted merely because it is no longer current.\n\n5. Records shall be retained in accordance with applicable State Government record-retention rules, departmental instructions and any legal or audit requirements.\n\nGovernment Orders and notifications — Retain in the official document archive; mark superseded where applicable.\n\nPolicies and guidelines — Retain current versions and preserve previous versions with clear status.\n\nTenders and procurement notices — Archive after closure or completion of the relevant process.\n\nPress releases and announcements — Move older items to a dated archive.\n\nEvents and programmes — Archive after the event or programme concludes.\n\nReports and publications — Retain in a searchable publication archive.\n\nOfficers and contact details — Replace outdated entries after verification; retain records as required.\n\nFAQs — Review and archive questions that are no longer relevant.\n\nPhotographs and videos — Retain approved media in the relevant gallery or archive subject to permissions.\n\nThe concerned section shall identify content for archival. The Website Nodal Officer shall coordinate the process, and archival or deletion shall be carried out only after the required approval.',NULL,NULL,NULL,NULL,0,180,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(19,NULL,'about','crp','Content Review Policy (CRP)','కంటెంట్ సమీక్ష విధానం (CRP)','To ensure that all information published on the Department’s website remains accurate, relevant, current and consistent with official records.\n\nSecretary and officers’ details — Monthly and whenever a change occurs.\n\nDepartment contact details — Monthly and whenever a change occurs.\n\nGovernment Orders and notifications — On receipt and before publication.\n\nPolicies and guidelines — Annually and whenever revised.\n\nTenders and procurement notices — Regularly during the active period.\n\nLatest news and announcements — Weekly or whenever new information is received.\n\nEvents and programmes — Before publication and after completion.\n\nPhotographs and videos — Quarterly.\n\nReports and publications — On release and during periodic review.\n\nFAQs — Quarterly.\n\nDistrict Explorer information — Quarterly and whenever verified changes occur.\n\nExternal links — Monthly.\n\nAccessibility information — Quarterly and after significant website changes.\n\n1. The Website Nodal Officer shall coordinate periodic reviews.\n\n2. The concerned section shall verify the accuracy of its respective content.\n\n3. Outdated information shall be corrected, replaced or archived after approval.\n\n4. Review dates and actions taken shall be recorded.\n\n5. Any major correction shall follow the approved content moderation and approval process.\n\nEach concerned section shall be responsible for the accuracy of information supplied by it. The designated Website Nodal Officer shall coordinate the review process.',NULL,NULL,NULL,NULL,0,190,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(20,NULL,'about','contingency','Contingency Management Plan','అత్యవసర నిర్వహణ ప్రణాళిక','To establish a response mechanism for website downtime, security incidents, unauthorised changes, defacement, data loss and other situations that may affect the availability or integrity of the Department’s website.\n\nWebsite unavailable or inaccessible.\n\nWebsite defacement or unauthorised content changes.\n\nSuspected cyberattack or security breach.\n\nLoss or corruption of website data.\n\nFailure of hosting, network or other technical infrastructure.\n\nUnauthorised disclosure of information.\n\n1. Detection — Identify and record the incident, including the time and affected website services.\n\n2. Reporting — Inform the designated Website Nodal Officer and authorised technical support team.\n\n3. Containment — Take appropriate steps to prevent further damage or unauthorised access.\n\n4. Escalation — Notify the concerned State IT/hosting agency and other competent authorities as applicable.\n\n5. Restoration — Restore the website using verified backups and authorised recovery procedures.\n\n6. Verification — Check the restored website, content integrity and essential services.\n\n7. Communication — Issue an approved public notice through appropriate official channels if required.\n\n8. Documentation — Record the incident, response, restoration and preventive measures.\n\nThe Department shall identify and notify the departmental Website Nodal Officer, the authorised website administrator, the hosting/technical support agency, the departmental administrative escalation authority and the relevant cybersecurity response authority as applicable.\n\nThe authorised technical team should maintain appropriate backups and periodically verify that restoration procedures are workable.\n\nCybersecurity incidents shall be handled in accordance with applicable Government security instructions and directions of the competent cybersecurity authorities.\n\nA separate internal contact and escalation directory shall be maintained with verified official contact details. Personal contact details should not be published in the public policy document.',NULL,NULL,NULL,NULL,0,200,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58'),(21,NULL,'about','help','Help – Using the Department Website','సహాయం – శాఖ వెబ్‌సైట్ వినియోగం','Welcome to the official website of the Department of Science, Technology & Innovation, Government of Andhra Pradesh. This page provides basic guidance to help visitors access information and navigate the website.\n\nUse the main navigation menu to access About the Department, Leadership and Officers, Organisations, Policies and Government Orders, Programmes and Initiatives, Events and Activities, Media Gallery, District Explorer, and Contact and Feedback.\n\nUse the website search facility, where available, to locate information by entering relevant keywords, document titles or subject names.\n\nDocuments may be provided in PDF or other formats. Select the relevant document link to open or download it. A suitable document reader may be required to view certain file formats.\n\nWhere available, users may select English or Telugu to access website information.\n\nUsers who face difficulty accessing website content may refer to the Accessibility Statement and contact the designated accessibility support officer.\n\nFor suggestions, feedback or website-related issues, users may use the approved feedback facility or contact the Department through the official contact details displayed on the Contact page.\n\nFor website-related technical issues, please contact:\n\nEmail: [Approved website support email]\n\nPhone: [Approved support number]\n\nWorking hours: [To be confirmed]','ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ అధికారిక వెబ్‌సైట్‌కు స్వాగతం. సందర్శకులు సమాచారాన్ని యాక్సెస్ చేయడానికి మరియు వెబ్‌సైట్‌ను నావిగేట్ చేయడానికి ఈ పేజీ ప్రాథమిక మార్గదర్శకాన్ని అందిస్తుంది.',NULL,NULL,NULL,1,210,'published',NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `password_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ph_user` (`user_id`),
  CONSTRAINT `password_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `password_history` WRITE;
/*!40000 ALTER TABLE `password_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_history` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policies` (
  `policy_id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary_en` text COLLATE utf8mb4_unicode_ci,
  `summary_te` text COLLATE utf8mb4_unicode_ci,
  `body_en` mediumtext COLLATE utf8mb4_unicode_ci,
  `body_te` mediumtext COLLATE utf8mb4_unicode_ci,
  `policy_period` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sector_id` int unsigned DEFAULT NULL,
  `pdf_file_id` int unsigned DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`policy_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `sector_id` (`sector_id`),
  KEY `pdf_file_id` (`pdf_file_id`),
  FULLTEXT KEY `ft_pol_en` (`name_en`,`summary_en`,`body_en`),
  FULLTEXT KEY `ft_pol_te` (`name_te`,`summary_te`,`body_te`),
  CONSTRAINT `policies_ibfk_1` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE SET NULL,
  CONSTRAINT `policies_ibfk_2` FOREIGN KEY (`pdf_file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `policies` WRITE;
/*!40000 ALTER TABLE `policies` DISABLE KEYS */;
INSERT INTO `policies` (`policy_id`, `slug`, `name_en`, `name_te`, `summary_en`, `summary_te`, `body_en`, `body_te`, `policy_period`, `sector_id`, `pdf_file_id`, `display_order`, `status`) VALUES (1,'sti-policy-2026-2031','Science, Technology & Innovation Policy 2026–2031','విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల విధానం 2026–2031','The Department of Science, Technology & Innovation is undertaking the formulation of a comprehensive Science, Technology & Innovation Policy for Andhra Pradesh for the period 2026–2031. The proposed policy is intended to provide a strategic framework for strengthening the State’s research, development, technology and innovation ecosystem. The policy formulation process envisages assessment of the existing ecosystem, stakeholder consultations, identification of priority technology areas, development of institutional and governance mechanisms, and preparation of an implementation framework. The final policy document and related Government Orders will be published following approval and notification by the Government.','ఆంధ్రప్రదేశ్‌లో పరిశోధన, అభివృద్ధి, సాంకేతికత మరియు ఆవిష్కరణల వ్యవస్థను బలోపేతం చేయడానికి విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ ఆంధ్రప్రదేశ్ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల విధానం (2026–2031) రూపకల్పన చేపట్టింది. ఈ ప్రతిపాదిత విధానం రాష్ట్రంలోని ప్రస్తుత పరిశోధన మరియు ఆవిష్కరణ వ్యవస్థను సమీక్షించడం, సంబంధిత భాగస్వాములతో సంప్రదింపులు నిర్వహించడం, ప్రాధాన్య సాంకేతిక రంగాలను గుర్తించడం, సంస్థాగత మరియు పాలనా వ్యవస్థను రూపొందించడం, అలాగే అమలు కార్యాచరణ ప్రణాళికను రూపొందించడం వంటి అంశాలను కలిగి ఉంటుంది. ప్రభుత్వ ఆమోదం మరియు అధికారిక ప్రకటన అనంతరం తుది విధాన పత్రం మరియు సంబంధిత ప్రభుత్వ ఉత్తర్వులు వెబ్‌సైట్‌లో ప్రచురించబడతాయి.',NULL,NULL,NULL,NULL,NULL,10,'published');
/*!40000 ALTER TABLE `policies` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `quick_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quick_links` (
  `link_id` int unsigned NOT NULL AUTO_INCREMENT,
  `link_group` enum('home_quick','useful_link','social') COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_te` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opens_new_tab` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` smallint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`link_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `quick_links` WRITE;
/*!40000 ALTER TABLE `quick_links` DISABLE KEYS */;
INSERT INTO `quick_links` (`link_id`, `link_group`, `label_en`, `label_te`, `url`, `opens_new_tab`, `display_order`, `is_active`) VALUES (1,'useful_link','Government of Andhra Pradesh','ఆంధ్రప్రదేశ్ ప్రభుత్వం','https://www.ap.gov.in',0,10,1),(2,'useful_link','Department of Science & Technology, Government of India','విజ్ఞాన శాస్త్ర & సాంకేతిక శాఖ, భారత ప్రభుత్వం','https://dst.gov.in',0,20,1),(3,'useful_link','Ministry of Electronics and Information Technology','ఎలక్ట్రానిక్స్ మరియు సమాచార సాంకేతిక మంత్రిత్వ శాఖ','https://www.meity.gov.in',0,30,1),(4,'useful_link','Indian Space Research Organisation','భారత అంతరిక్ష పరిశోధన సంస్థ','https://www.isro.gov.in',0,40,1),(5,'useful_link','Council of Scientific and Industrial Research','శాస్త్రీయ మరియు పారిశ్రామిక పరిశోధన మండలి','https://www.csir.res.in',0,50,1),(6,'useful_link','Andhra Pradesh e-Procurement','ఆంధ్రప్రదేశ్ ఇ-ప్రొక్యూర్‌మెంట్','https://tender.apeprocurement.gov.in/',0,60,1),(7,'useful_link','RTI Online','RTI ఆన్‌లైన్','https://rtionline.gov.in',0,70,1),(8,'useful_link','Startup India','స్టార్టప్ ఇండియా','https://www.startupindia.gov.in',0,80,1),(9,'useful_link','Anusandhan National Research Foundation','అనుసంధాన్ జాతీయ పరిశోధన ఫౌండేషన్','https://anrfonline.in',0,90,1);
/*!40000 ALTER TABLE `quick_links` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES (1,'admin','Full access including users and settings'),(2,'approver','Reviews and publishes content'),(3,'editor','Creates and edits content; sends for approval'),(4,'viewer','Read-only access to CMS and feedback');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `science_stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `science_stories` (
  `story_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  `video_file_id` int unsigned DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_id` int unsigned DEFAULT NULL,
  `captions_file_id` int unsigned DEFAULT NULL,
  `duration_sec` smallint unsigned DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`story_id`),
  KEY `video_file_id` (`video_file_id`),
  KEY `thumbnail_id` (`thumbnail_id`),
  KEY `captions_file_id` (`captions_file_id`),
  CONSTRAINT `science_stories_ibfk_1` FOREIGN KEY (`video_file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `science_stories_ibfk_2` FOREIGN KEY (`thumbnail_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `science_stories_ibfk_3` FOREIGN KEY (`captions_file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `science_stories` WRITE;
/*!40000 ALTER TABLE `science_stories` DISABLE KEYS */;
/*!40000 ALTER TABLE `science_stories` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sectors` (
  `sector_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name_en` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_te` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`sector_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sectors` WRITE;
/*!40000 ALTER TABLE `sectors` DISABLE KEYS */;
INSERT INTO `sectors` (`sector_id`, `name_en`, `name_te`, `slug`) VALUES (1,'IT & GCC',NULL,'it-gcc'),(2,'Electronics',NULL,'electronics'),(3,'Semiconductor',NULL,'semiconductor'),(4,'Data Centre',NULL,'data-centre'),(5,'Drone',NULL,'drone'),(6,'Space',NULL,'space'),(7,'Biotechnology',NULL,'biotechnology'),(8,'Science, Technology & Innovation',NULL,'sti');
/*!40000 ALTER TABLE `sectors` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int unsigned NOT NULL,
  `csrf_token` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_sess_user` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES ('about','{\"intro\":[{\"en\":\"The Department of Science, Technology & Innovation (DST&I), Government of Andhra Pradesh, is entrusted with promoting scientific advancement, technological development, research and innovation across the State. The Department aims to strengthen Andhra Pradesh’s scientific and technological ecosystem by facilitating research, encouraging innovation, promoting technology adoption and fostering collaboration among government departments, academic institutions, research organisations, industries and other stakeholders.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వంలోని విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ (DST&I), రాష్ట్రవ్యాప్తంగా శాస్త్రీయ పురోగతి, సాంకేతిక అభివృద్ధి, పరిశోధన మరియు ఆవిష్కరణలను ప్రోత్సహించే బాధ్యతను నిర్వహిస్తుంది. పరిశోధనను సులభతరం చేయడం, ఆవిష్కరణలను ప్రోత్సహించడం, సాంకేతిక వినియోగాన్ని పెంచడం మరియు ప్రభుత్వ శాఖలు, విద్యాసంస్థలు, పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు ఇతర భాగస్వాముల మధ్య సహకారాన్ని పెంపొందించడం ద్వారా ఆంధ్రప్రదేశ్ శాస్త్రీయ, సాంకేతిక పర్యావరణ వ్యవస్థను బలోపేతం చేయడం ఈ శాఖ లక్ష్యం.\"},{\"en\":\"The Department was established through G.O.Ms.No.28, General Administration (Cabinet-II) Department, dated 06.03.2026, with the objective of providing focused administrative direction and coordination for Science, Technology & Innovation-related activities in Andhra Pradesh.\",\"te\":\"సాధారణ పరిపాలన (కేబినెట్-II) శాఖ జారీ చేసిన జీ.ఓ.ఎం.ఎస్. నం.28, తేదీ 06.03.2026 ద్వారా, ఆంధ్రప్రదేశ్‌లో విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన కార్యకలాపాలకు కేంద్రీకృత పరిపాలనా దిశానిర్దేశం మరియు సమన్వయం కల్పించే లక్ష్యంతో ఈ శాఖ ఏర్పాటు చేయబడింది.\"},{\"en\":\"The Department seeks to create an enabling environment for scientific research, development and innovation by supporting research institutions, universities, scientific organisations, technology-driven enterprises and innovation ecosystems. It works towards promoting research and development (R&D), facilitating the translation of scientific discoveries into practical applications, encouraging technology commercialisation and strengthening linkages between academia, industry and government.\",\"te\":\"పరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, శాస్త్రీయ సంస్థలు, సాంకేతిక ఆధారిత సంస్థలు మరియు ఆవిష్కరణ పర్యావరణ వ్యవస్థలకు మద్దతు అందించడం ద్వారా శాస్త్రీయ పరిశోధన, అభివృద్ధి మరియు ఆవిష్కరణలకు అనుకూలమైన వాతావరణాన్ని సృష్టించడం ఈ శాఖ లక్ష్యం. పరిశోధన మరియు అభివృద్ధిని (R&D) ప్రోత్సహించడం, శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలుగా మార్చడాన్ని సులభతరం చేయడం, సాంకేతిక వాణిజ్యీకరణను ప్రోత్సహించడం మరియు విద్యాసంస్థలు, పరిశ్రమలు, ప్రభుత్వాల మధ్య సంబంధాలను బలోపేతం చేయడం కోసం ఇది కృషి చేస్తుంది.\"},{\"en\":\"Its areas of focus include the promotion of science and scientific temper, emerging and advanced technologies, information technology, electronics, space technology and applications, innovation, research and development, start-up ecosystems and technology-led solutions for governance and public service delivery. The Department also seeks to encourage the adoption of emerging technologies and facilitate partnerships with national and international research institutions, industries and knowledge organisations.\",\"te\":\"శాస్త్రీయ దృక్పథం మరియు విజ్ఞాన ప్రచారం, అభివృద్ధి చెందుతున్న మరియు ఆధునిక సాంకేతికతలు, సమాచార సాంకేతికత, ఎలక్ట్రానిక్స్, అంతరిక్ష సాంకేతికత మరియు అనువర్తనాలు, ఆవిష్కరణలు, పరిశోధన మరియు అభివృద్ధి, స్టార్టప్ పర్యావరణ వ్యవస్థలు మరియు పరిపాలన, ప్రజా సేవలలో సాంకేతిక ఆధారిత పరిష్కారాలు ఈ శాఖ దృష్టి కేంద్రాలలో ఉన్నాయి. అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం మరియు జాతీయ, అంతర్జాతీయ పరిశోధనా సంస్థలు, పరిశ్రమలు మరియు విజ్ఞాన సంస్థలతో భాగస్వామ్యాలను సులభతరం చేయడం కూడా ఈ శాఖ లక్ష్యం.\"},{\"en\":\"Through coordination with institutions and organisations associated with science, technology and innovation, the Department aims to strengthen research infrastructure, promote scientific awareness, support innovation-driven initiatives and facilitate the development of technology-based solutions to address societal and developmental challenges.\",\"te\":\"విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన సంస్థలతో సమన్వయం ద్వారా, పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, శాస్త్రీయ అవగాహనను ప్రోత్సహించడం, ఆవిష్కరణ ఆధారిత కార్యక్రమాలకు మద్దతు అందించడం మరియు సామాజిక, అభివృద్ధి సవాళ్లను పరిష్కరించడానికి సాంకేతిక ఆధారిత పరిష్కారాలను అభివృద్ధి చేయడం ఈ శాఖ లక్ష్యం.\"},{\"en\":\"The Department envisions positioning Andhra Pradesh as a leading destination for scientific research, technological advancement and innovation, contributing to sustainable economic growth, employment generation, improved public services and the State’s long-term development vision of Swarna Andhra Pradesh @ 2047.\",\"te\":\"శాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలకు ఆంధ్రప్రదేశ్‌ను ప్రముఖ గమ్యస్థానంగా నిలపడం, సుస్థిర ఆర్థిక వృద్ధి, ఉపాధి కల్పన, మెరుగైన ప్రజా సేవలు మరియు స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 దీర్ఘకాలిక అభివృద్ధి లక్ష్యానికి దోహదపడటం ఈ శాఖ ఆకాంక్ష.\"}],\"vision\":{\"en\":\"To position Andhra Pradesh as a leading national and global hub for scientific research, technological advancement and innovation, fostering a knowledge-driven and innovation-led economy in alignment with the vision of Swarna Andhra Pradesh @ 2047.\",\"te\":\"స్వర్ణ ఆంధ్రప్రదేశ్ @ 2047 లక్ష్యానికి అనుగుణంగా, శాస్త్రీయ పరిశోధన, సాంకేతిక పురోగతి మరియు ఆవిష్కరణలలో ఆంధ్రప్రదేశ్‌ను జాతీయ మరియు అంతర్జాతీయ ప్రముఖ కేంద్రంగా నిలపడం, విజ్ఞాన ఆధారిత మరియు ఆవిష్కరణ ఆధారిత ఆర్థిక వ్యవస్థను అభివృద్ధి చేయడం.\"},\"mission\":{\"en\":\"To promote scientific research, technological development and innovation through effective policies, institutional coordination and strategic partnerships. To strengthen research infrastructure, encourage collaboration among academia, industry and government, facilitate technology transfer and commercialisation, and support the adoption of emerging technologies for sustainable development and improved quality of life in Andhra Pradesh.\",\"te\":\"సమర్థవంతమైన విధానాలు, సంస్థాగత సమన్వయం మరియు వ్యూహాత్మక భాగస్వామ్యాల ద్వారా శాస్త్రీయ పరిశోధన, సాంకేతిక అభివృద్ధి మరియు ఆవిష్కరణలను ప్రోత్సహించడం. పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం, విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారాన్ని ప్రోత్సహించడం, సాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం, ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి మరియు మెరుగైన జీవన ప్రమాణాల కోసం అభివృద్ధి చెందుతున్న సాంకేతికతల వినియోగాన్ని ప్రోత్సహించడం.\"},\"objectives\":[{\"en\":\"Promote Scientific Research and Development: Encourage and facilitate scientific research and R&D activities across universities, research institutions and other eligible organisations in Andhra Pradesh.\",\"te\":\"శాస్త్రీయ పరిశోధన మరియు అభివృద్ధిని ప్రోత్సహించడం: ఆంధ్రప్రదేశ్‌లోని విశ్వవిద్యాలయాలు, పరిశోధనా సంస్థలు మరియు ఇతర అర్హత కలిగిన సంస్థలలో శాస్త్రీయ పరిశోధన మరియు పరిశోధన–అభివృద్ధి కార్యకలాపాలను ప్రోత్సహించడం.\"},{\"en\":\"Strengthen Research Infrastructure: Support the development, modernisation and effective utilisation of scientific laboratories, research facilities, testing centres and advanced technological infrastructure.\",\"te\":\"పరిశోధనా మౌలిక సదుపాయాలను బలోపేతం చేయడం: శాస్త్రీయ ప్రయోగశాలలు, పరిశోధనా కేంద్రాలు, పరీక్షా కేంద్రాలు మరియు ఆధునిక సాంకేతిక మౌలిక సదుపాయాల అభివృద్ధి, ఆధునీకరణ మరియు సమర్థవంతమైన వినియోగానికి తోడ్పడటం.\"},{\"en\":\"Foster Innovation and Entrepreneurship: Promote innovation ecosystems, technology incubation, start-ups and entrepreneurship by facilitating collaboration between academia, industry and government.\",\"te\":\"ఆవిష్కరణలు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం: విద్యాసంస్థలు, పరిశ్రమలు మరియు ప్రభుత్వాల మధ్య సహకారం ద్వారా ఆవిష్కరణ వ్యవస్థలు, సాంకేతిక ఇంక్యుబేషన్ కేంద్రాలు, స్టార్టప్‌లు మరియు పారిశ్రామికవేత్తలను ప్రోత్సహించడం.\"},{\"en\":\"Advance Emerging Technologies: Encourage the adoption, development and application of emerging and advanced technologies, including Artificial Intelligence, Quantum Technologies, Space Technology, Electronics and other frontier technologies.\",\"te\":\"అభివృద్ధి చెందుతున్న సాంకేతికతలను ప్రోత్సహించడం: కృత్రిమ మేధస్సు (AI), క్వాంటం సాంకేతికతలు, అంతరిక్ష సాంకేతికత, ఎలక్ట్రానిక్స్ మరియు ఇతర ఆధునిక సాంకేతిక రంగాల అభివృద్ధి, ప్రవేశం మరియు అనువర్తనాలను ప్రోత్సహించడం.\"},{\"en\":\"Facilitate Technology Transfer and Commercialisation: Promote the conversion of research outcomes and scientific discoveries into practical applications, products, services and commercially viable technologies.\",\"te\":\"సాంకేతిక బదిలీ మరియు వాణిజ్యీకరణను సులభతరం చేయడం: పరిశోధన ఫలితాలు మరియు శాస్త్రీయ ఆవిష్కరణలను ఆచరణాత్మక అనువర్తనాలు, ఉత్పత్తులు, సేవలు మరియు వాణిజ్యపరంగా ఉపయోగపడే సాంకేతికతలుగా మార్చడాన్ని ప్రోత్సహించడం.\"},{\"en\":\"Promote Scientific Temper and Awareness: Encourage scientific awareness, research orientation and science outreach activities among students, youth, educational institutions and the general public.\",\"te\":\"శాస్త్రీయ దృక్పథం మరియు అవగాహనను పెంపొందించడం: విద్యార్థులు, యువత, విద్యాసంస్థలు మరియు సాధారణ ప్రజలలో శాస్త్రీయ అవగాహన, పరిశోధనా ఆసక్తి మరియు విజ్ఞాన ప్రచార కార్యక్రమాలను ప్రోత్సహించడం.\"},{\"en\":\"Strengthen Institutional and Strategic Partnerships: Facilitate collaboration with national and international research institutions, universities, industries, government agencies and scientific organisations.\",\"te\":\"సంస్థాగత మరియు వ్యూహాత్మక భాగస్వామ్యాలను బలోపేతం చేయడం: జాతీయ మరియు అంతర్జాతీయ పరిశోధనా సంస్థలు, విశ్వవిద్యాలయాలు, పరిశ్రమలు, ప్రభుత్వ సంస్థలు మరియు శాస్త్రీయ సంస్థలతో సహకారాన్ని ప్రోత్సహించడం.\"},{\"en\":\"Leverage Science and Technology for Development: Promote the application of science, technology and innovation to address societal challenges, improve public service delivery, generate employment and support sustainable development in Andhra Pradesh.\",\"te\":\"అభివృద్ధి కోసం విజ్ఞాన శాస్త్రం మరియు సాంకేతికతను వినియోగించడం: సామాజిక సవాళ్ల పరిష్కారం, ప్రజా సేవల మెరుగుదల, ఉపాధి కల్పన మరియు ఆంధ్రప్రదేశ్‌లో సుస్థిర అభివృద్ధి కోసం విజ్ఞాన శాస్త్రం, సాంకేతికత మరియు ఆవిష్కరణల అనువర్తనాలను ప్రోత్సహించడం.\"}],\"orgStructure\":{\"en\":\"The Department of Science, Technology & Innovation (DST&I), Government of Andhra Pradesh, functions under the administrative leadership of the Hon’ble Minister for Science, Technology & Innovation, with the Secretary to Government serving as the administrative head of the Department.\\n\\nThe Department’s organisational framework comprises the Administration & Finance Division and Scientific Divisions / Programmes, supported by the concerned administrative officers, scientists and technologists. The Administration & Finance Division is responsible for administrative coordination, establishment matters, financial management and operational support. The Scientific Divisions / Programmes focus on Science & Technology Policy, Research & Development Promotion, Technology Commercialisation, Digital and Emerging Technologies, Innovation and Start-up Ecosystems, and Collaboration with National and International Research Institutions.\\n\\nThe Department also coordinates with relevant institutions, centres, societies, corporations and other associated initiatives in the areas of science, technology and innovation to strengthen the State’s research, development and innovation ecosystem.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వంలోని విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ (DST&I), గౌరవనీయులైన విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ మంత్రి పరిపాలనా మార్గదర్శకత్వంలో పనిచేస్తుంది. ప్రభుత్వ కార్యదర్శి ఈ శాఖకు పరిపాలనా అధిపతిగా వ్యవహరిస్తారు.\\n\\nఈ శాఖ సంస్థాగత నిర్మాణంలో పరిపాలన మరియు ఆర్థిక విభాగం, శాస్త్రీయ విభాగాలు / కార్యక్రమాలు ప్రధాన భాగాలు. వీటికి సంబంధిత పరిపాలనా అధికారులు, శాస్త్రవేత్తలు మరియు సాంకేతిక నిపుణులు తోడ్పడతారు. పరిపాలన మరియు ఆర్థిక విభాగం పరిపాలనా సమన్వయం, స్థాపన వ్యవహారాలు, ఆర్థిక నిర్వహణ మరియు కార్యాచరణ సంబంధిత తోడ్పాటును నిర్వహిస్తుంది. శాస్త్రీయ విభాగాలు / కార్యక్రమాలు విజ్ఞాన శాస్త్రం మరియు సాంకేతిక విధానం, పరిశోధన మరియు అభివృద్ధి ప్రోత్సాహం, సాంకేతిక వాణిజ్యీకరణ, డిజిటల్ మరియు అభివృద్ధి చెందుతున్న సాంకేతికతలు, ఆవిష్కరణలు మరియు స్టార్టప్ వ్యవస్థలు, జాతీయ మరియు అంతర్జాతీయ పరిశోధనా సంస్థలతో సహకారం వంటి అంశాలపై కృషి చేస్తాయి.\\n\\nరాష్ట్ర పరిశోధన, అభివృద్ధి మరియు ఆవిష్కరణ వ్యవస్థను బలోపేతం చేయడానికి, విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణలకు సంబంధించిన సంస్థలు, కేంద్రాలు, సొసైటీలు, కార్పొరేషన్లు మరియు ఇతర అనుబంధ కార్యక్రమాలతో ఈ శాఖ సమన్వయం చేసుకుంటుంది.\"},\"orgChart\":\"\"}'),('contact','{\"headOffice\":{\"en\":\"Room No. 275-A, First Floor, Building No. 5, Andhra Pradesh Secretariat, Velagapudi, Amaravati, Andhra Pradesh – 522238.\",\"te\":\"గది నం. 275-A, మొదటి అంతస్తు, భవనం నం. 5, ఆంధ్రప్రదేశ్ సచివాలయం, వెలగపూడి, అమరావతి, ఆంధ్రప్రదేశ్ – 522238.\"},\"phone\":\"+91 8632445988, +91 8632445379\",\"fax\":\"\",\"email\":\"secy-sti@ap.gov.in\",\"workingHours\":{\"en\":\"The Department functions during the working hours prescribed by the Government of Andhra Pradesh, except on notified public holidays.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వం నిర్దేశించిన కార్యాలయ వేళల్లో, ప్రకటించిన ప్రభుత్వ సెలవు దినాలు మినహా, శాఖ కార్యకలాపాలు నిర్వహించబడతాయి.\"},\"mapUrl\":\"https://maps.app.goo.gl/pYB1cWjM9iYNhuFU7\",\"mapEmbed\":\"https://maps.google.com/maps?q=16.514598,80.515660&z=16&output=embed\"}'),('home','{\"showTicker\":true,\"showAudiences\":true,\"showServices\":true,\"showStats\":true,\"showDistricts\":true,\"showAlmanac\":true,\"showStory\":false,\"showConnections\":false,\"showArticles\":true,\"showStories\":false,\"showEvents\":false,\"articlesTitle\":{\"en\":\"Latest Updates\",\"te\":\"తాజా నవీకరణలు\"},\"articlesSubtitle\":{\"en\":\"Government Orders, tenders, events, results and announcements from the Department.\",\"te\":\"శాఖ నుండి ప్రభుత్వ ఉత్తర్వులు, టెండర్లు, కార్యక్రమాలు, ఫలితాలు మరియు ప్రకటనలు.\"},\"showGallery\":false,\"galleryTitle\":{\"en\":\"Photo Gallery\",\"te\":\"ఫోటో గ్యాలరీ\"},\"galleryTagline\":{\"en\":\"\",\"te\":\"\"}}'),('investors','{\"intro\":{\"en\":\"Andhra Pradesh is working towards strengthening its position as a destination for research, technology development, innovation and investment. The State’s development priorities include emerging technologies, advanced manufacturing, research infrastructure, innovation ecosystems and collaboration between Government, academia and industry. Through its Science, Technology & Innovation initiatives, the Government seeks to encourage research partnerships, technology development, entrepreneurship and the commercialisation of innovative solutions.\",\"te\":\"పరిశోధన, సాంకేతిక అభివృద్ధి, ఆవిష్కరణలు మరియు పెట్టుబడులకు అనుకూలమైన గమ్యస్థానంగా ఆంధ్రప్రదేశ్ స్థానాన్ని బలోపేతం చేయడానికి ప్రభుత్వం కృషి చేస్తోంది. అభివృద్ధి ప్రాధాన్యతలలో అభివృద్ధి చెందుతున్న సాంకేతికతలు, అధునాతన తయారీ రంగం, పరిశోధనా మౌలిక సదుపాయాలు, ఆవిష్కరణ వ్యవస్థలు మరియు ప్రభుత్వం, విద్యాసంస్థలు, పరిశ్రమల మధ్య సహకారం ఉన్నాయి. విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల కార్యక్రమాల ద్వారా పరిశోధనా భాగస్వామ్యాలు, సాంకేతిక అభివృద్ధి, పారిశ్రామికవేత్తలు మరియు వినూత్న పరిష్కారాల వాణిజ్యీకరణకు ప్రోత్సాహం అందించాలనే లక్ష్యంతో ప్రభుత్వం ఉంది.\"},\"whyInvest\":[],\"steps\":[]}'),('site','{\"name\":{\"en\":\"Department of Science, Technology & Innovation\",\"te\":\"విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ\"},\"shortName\":\"DST&I\",\"tagline\":{\"en\":\"Science, Technology & Innovation for a Swarna Andhra Pradesh\",\"te\":\"స్వర్ణ ఆంధ్రప్రదేశ్ కోసం విజ్ఞాన శాస్త్రం, సాంకేతికత మరియు ఆవిష్కరణలు\"},\"gov\":{\"en\":\"Government of Andhra Pradesh\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వం\"},\"logo\":\"/images/logo.png\",\"domain\":\"https://dsti.ap.gov.in\",\"ctaLabel\":{\"en\":\"Ask Vigyan Mitra\",\"te\":\"విజ్ఞాన మిత్రను అడగండి\"},\"footerAbout\":{\"en\":\"The Department of Science, Technology & Innovation, Government of Andhra Pradesh, promotes scientific research, technological advancement and innovation to drive sustainable development and build a knowledge-driven, innovation-led Andhra Pradesh.\",\"te\":\"ఆంధ్రప్రదేశ్ ప్రభుత్వ విజ్ఞాన శాస్త్ర, సాంకేతిక మరియు ఆవిష్కరణల శాఖ, సుస్థిర అభివృద్ధిని సాధించడానికి మరియు విజ్ఞాన ఆధారిత, ఆవిష్కరణలతో కూడిన ఆంధ్రప్రదేశ్‌ను నిర్మించడానికి శాస్త్రీయ పరిశోధన, సాంకేతిక అభివృద్ధి మరియు ఆవిష్కరణలను ప్రోత్సహిస్తుంది.\"},\"social\":[]}'),('system','{\"feedbackNotifyEmail\":\"secy-sti@ap.gov.in\"}');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `social_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_links` (
  `social_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` tinyint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`social_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `social_links` WRITE;
/*!40000 ALTER TABLE `social_links` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_links` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `story_panels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `story_panels` (
  `panel_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text_en` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text_te` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_id` int unsigned DEFAULT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`panel_id`),
  KEY `image_id` (`image_id`),
  CONSTRAINT `story_panels_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `story_panels` WRITE;
/*!40000 ALTER TABLE `story_panels` DISABLE KEYS */;
/*!40000 ALTER TABLE `story_panels` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tenders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenders` (
  `tender_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tender_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_te` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_te` text COLLATE utf8mb4_unicode_ci,
  `published_date` date NOT NULL,
  `last_date` datetime NOT NULL,
  `status` enum('open','closed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `display_order` smallint NOT NULL DEFAULT '0',
  `file_id` int unsigned DEFAULT NULL,
  `corrigendum_file_id` int unsigned DEFAULT NULL,
  `publish_status` enum('draft','pending','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`tender_id`),
  UNIQUE KEY `tender_number` (`tender_number`),
  KEY `idx_tender_status` (`status`,`last_date`),
  KEY `file_id` (`file_id`),
  KEY `corrigendum_file_id` (`corrigendum_file_id`),
  KEY `created_by` (`created_by`),
  FULLTEXT KEY `ft_tender` (`title_en`,`description_en`,`tender_number`),
  CONSTRAINT `tenders_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `tenders_ibfk_2` FOREIGN KEY (`corrigendum_file_id`) REFERENCES `media_files` (`file_id`) ON DELETE SET NULL,
  CONSTRAINT `tenders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tenders` WRITE;
/*!40000 ALTER TABLE `tenders` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenders` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` tinyint unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `must_change_password` tinyint(1) NOT NULL DEFAULT '1',
  `failed_logins` tinyint unsigned NOT NULL DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `username`, `full_name`, `email`, `password_hash`, `role_id`, `is_active`, `must_change_password`, `failed_logins`, `locked_until`, `last_login_at`, `password_changed_at`, `created_at`, `updated_at`) VALUES (1,'admin','Website Administrator','admin@dsti.ap.gov.in','$2b$12$doOD9QyRf932yZTPtw4EnucSqP0vfncukUhj6TxXYzQLHSLvxadJ.',1,1,1,0,NULL,NULL,NULL,'2026-11-14 10:51:58','2026-11-14 10:51:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

