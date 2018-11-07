-- MySQL dump 10.13  Distrib 8.0.12, for macos10.13 (x86_64)
--
-- Host: localhost    Database: yidian
-- ------------------------------------------------------
-- Server version	8.0.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `yidian_advice_feedback`
--

DROP TABLE IF EXISTS `yidian_advice_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_advice_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'title' COMMENT '标题',
  `content` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'content' COMMENT '内容',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `user_id` int(5) NOT NULL,
  `user_name` varchar(45) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_advice_feedback`
--

LOCK TABLES `yidian_advice_feedback` WRITE;
/*!40000 ALTER TABLE `yidian_advice_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_advice_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_kb_address`
--

DROP TABLE IF EXISTS `yidian_kb_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_kb_address` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_date` datetime NOT NULL,
  `update_date` datetime DEFAULT NULL,
  `status` int(2) NOT NULL DEFAULT '1',
  `detail` varchar(1000) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `phone` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `user_id` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `contact` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `remark` varchar(1000) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '邮编',
  `p_code` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `c_code` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `a_code` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `pca` varchar(450) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_kb_address`
--

LOCK TABLES `yidian_kb_address` WRITE;
/*!40000 ALTER TABLE `yidian_kb_address` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_kb_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_kb_number`
--

DROP TABLE IF EXISTS `yidian_kb_number`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_kb_number` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '快递单号',
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '状态 1是启用 2是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `plant` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '平台',
  `company` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'ST',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_kb_number`
--

LOCK TABLES `yidian_kb_number` WRITE;
/*!40000 ALTER TABLE `yidian_kb_number` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_kb_number` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_kb_order`
--

DROP TABLE IF EXISTS `yidian_kb_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_kb_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '订单号',
  `created_date` datetime NOT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `status` int(3) NOT NULL DEFAULT '1' COMMENT '状态\\\\n1 待扫描\\\\n2 已扫描\\\\n3 已取消',
  `user_id` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '下单用户id',
  `plant` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '电商平台',
  `kb_number` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '空包单号',
  `address_from` varchar(1000) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '发货地址',
  `address_to` mediumtext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '收货地址',
  `total` int(3) NOT NULL COMMENT '总价',
  `remark` varchar(2000) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `kb_company` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '快递公司',
  `address_to_pca` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `to_phone` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `to_name` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  `kb_weight` float NOT NULL DEFAULT '0' COMMENT '重量',
  `address_from_pca` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_kb_order`
--

LOCK TABLES `yidian_kb_order` WRITE;
/*!40000 ALTER TABLE `yidian_kb_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_kb_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_kb_type`
--

DROP TABLE IF EXISTS `yidian_kb_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_kb_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `description` varchar(2000) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '描述',
  `created_date` datetime NOT NULL,
  `status` int(2) NOT NULL DEFAULT '1',
  `price` float NOT NULL,
  `plant` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `update_date` datetime DEFAULT NULL,
  `code` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'ZT' COMMENT '简称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_kb_type`
--

LOCK TABLES `yidian_kb_type` WRITE;
/*!40000 ALTER TABLE `yidian_kb_type` DISABLE KEYS */;
INSERT INTO `yidian_kb_type` VALUES (1,'百世快递【淘宝、天猫专用】','有无底单：有 ， 申请底单：12小时之内 ， 底单收费：免费 +内网 ，签收时间：2--3天  ，物流显示时间：21点前下单，次日中午之前显示， 百世快递（同步淘宝、天猫','2018-11-02 11:29:31',1,230,'TB','2018-11-05 11:43:54','BS'),(2,'申通快递【淘宝、天猫专用】','有无底单：有 申请底单：12小时之内 底单免费：免费+内网截图 签收时间：2--3天 重量：0.1-10KG 物流显示时间：21点前下单，次日中午之前显示  申通快递（同步淘宝、天猫）','2018-11-02 15:11:42',1,200,'TB','2018-11-05 11:43:48','ST'),(3,'圆通快递【淘宝、天猫、阿里专用】','有无底单：有 申请底单：12小时之内 底单免费：免费+内网截图 签收时间：2--3天 重量：0.1-10KG 物流显示时间：21点前下单，次日中午之前显示  国通快递（同步淘宝、天猫）','2018-11-02 15:15:54',1,200,'TB','2018-11-05 11:43:42','YT'),(4,'申通快递【京东专用】','1：此申通快递，物流显示、京东、快递100、官网  2：每天21点之前下单的当天晚上统一扫描发货，隔天上午出物流','2018-11-02 15:16:59',1,200,'JD','2018-11-05 11:44:06','ST'),(5,'龙邦快递【京东专用】','每天21点之前下单当天晚上显示物流，本页面龙邦快递只能在京东发货，超21点以后购买的是第二天晚上出物流！','2018-11-02 15:17:34',1,100,'JD','2018-11-05 11:44:11','LB'),(6,'国通快递【京东专用】','建议：店铺每天（16点-21点）点发货最佳，因为隔天上午才出物流','2018-11-02 15:18:16',1,100,'JD','2018-11-05 11:44:17','GT'),(7,'国通快递【拼多多专用】','下单后及时发货，如果延迟到第二天在发货导致没有物流，平台不负责  ps：收件人不要填电商名字，比如：xx公司，xx电商公司   使用平台：拼多多，官网 快递底单：降权可提供 签收时间：1-4天 发货时间：每天发货两次！稳定物流不超时                  晚上21.30--至--中午13.30下单的傍晚更新物流                  中午13.30--至--晚上21.30下单的半夜更新物流','2018-11-02 15:22:36',1,100,'PDD','2018-11-05 11:44:22','GT'),(8,'龙邦快递【拼多多专用】','下单后及时发货，如果延迟到第二天在发货导致没有物流，平台不负责  ps：收件人不要填电商名字，比如：xx公司，xx电商公司   使用平台：拼多多，官网 快递底单：降权可提供 签收时间：1-4天 发货时间：每天发货两次！稳定物流不超时                  晚上21.30--至--中午13.30下单的傍晚更新物流                  中午13.30--至--晚上21.30下单的半夜更新物流','2018-11-02 15:24:59',1,100,'PDD','2018-11-05 11:44:28','LB'),(9,'申通快递【拼多多专用】','每天14点之前下单当天15点左右出物流，21点之前下单23点左右出物流，本快递只能在拼多多发货！','2018-11-02 15:25:38',1,200,'PDD','2018-11-06 09:26:17','ST'),(10,'百世快递【拼多多专用】','每天14点之前下单当天15点左右出物流，21点之前下单23点左右出物流，本快递只能在拼多多发货！','2018-11-02 15:26:20',1,200,'PDD','2018-11-05 11:44:39','BS'),(11,'亚风速运【拼多多专用】','每天14点之前下单当天15点左右出物流，21点之前下单23点左右出物流，本快递只能在拼多多发货！','2018-11-02 15:26:52',1,100,'PDD','2018-11-05 11:44:45','YF');
/*!40000 ALTER TABLE `yidian_kb_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_logs_score`
--

DROP TABLE IF EXISTS `yidian_logs_score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_logs_score` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime NOT NULL,
  `user_name` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0' COMMENT '扣减或者充值的数量',
  `type` int(2) NOT NULL DEFAULT '1' COMMENT '日志类型\\\\n1，充值\\\\n2，流量订单消费\\\\n3，退款\\\\n4，充值赠送\\\\n5，佣金 6，账号升级消费 7，空包订单消费',
  `order_number` varchar(100) COLLATE utf8_bin DEFAULT NULL COMMENT '订单号',
  `balance` int(10) NOT NULL DEFAULT '0' COMMENT '积分余额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_logs_score`
--

LOCK TABLES `yidian_logs_score` WRITE;
/*!40000 ALTER TABLE `yidian_logs_score` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_logs_score` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_notice`
--

DROP TABLE IF EXISTS `yidian_notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `notice_title` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'title' COMMENT '通知标题',
  `notice_content` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'content' COMMENT '通知内容',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `task_order_number` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '任务订单号\n用于向远程服务器查找订单使用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_notice`
--

LOCK TABLES `yidian_notice` WRITE;
/*!40000 ALTER TABLE `yidian_notice` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_notice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_package`
--

DROP TABLE IF EXISTS `yidian_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_package` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `package_name` varchar(110) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'name' COMMENT '套餐名称',
  `package_present_score` int(225) DEFAULT '0' COMMENT '赠送积分',
  `package_purchase_score` int(225) DEFAULT '0' COMMENT '购买积分',
  `package_present_money` int(11) NOT NULL DEFAULT '0' COMMENT '赠送金额',
  `package_purchase_money` int(11) NOT NULL DEFAULT '0' COMMENT '购买金额',
  `package_pay_method` int(11) NOT NULL DEFAULT '0' COMMENT '支付方式\n0是支付宝和微信\n1是微信\n2是支付宝',
  `status` int(11) DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_package`
--

LOCK TABLES `yidian_package` WRITE;
/*!40000 ALTER TABLE `yidian_package` DISABLE KEYS */;
INSERT INTO `yidian_package` VALUES (1,'1000元（赠送80元）',10000,400000,8000,100000,0,1,'2018-07-14 16:52:41','2018-11-05 09:51:13'),(2,'2000元（赠送200元）',20000,800000,20000,200000,0,1,'2018-07-14 17:32:53','2018-10-28 00:00:36'),(6,'500元（赠送30）',5000,200000,3000,50000,0,1,'2018-10-27 09:47:05','2018-11-05 09:50:11'),(7,'1元',10,400,0,100,0,1,'2018-10-27 12:48:41','2018-11-05 09:46:19'),(8,'100元',1000,40000,0,10000,0,1,'2018-10-27 23:42:26','2018-11-05 09:49:46'),(9,'200元（赠送10）',2000,80000,1000,20000,0,1,'2018-10-27 23:46:10','2018-11-05 09:52:43'),(11,'10元',100,4000,0,1000,0,1,'2018-10-28 00:03:04','2018-11-05 09:47:46'),(12,'5元',50,2000,0,500,0,1,'2018-11-05 09:47:28',NULL),(13,'20元',200,8000,0,2000,0,1,'2018-11-05 09:48:17',NULL),(14,'50元',500,20000,0,5000,0,1,'2018-11-05 09:48:41','2018-11-05 09:49:03'),(15,'30元',300,12000,0,3000,0,1,'2018-11-05 09:49:26',NULL),(16,'300元（赠送20）',3000,120000,2000,30000,0,1,'2018-11-05 09:50:43','2018-11-05 11:22:44');
/*!40000 ALTER TABLE `yidian_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_plant`
--

DROP TABLE IF EXISTS `yidian_plant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_plant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plantname` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '平台名称',
  `description` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '平台描述',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态 \n1是启用 \n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='平台表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_plant`
--

LOCK TABLES `yidian_plant` WRITE;
/*!40000 ALTER TABLE `yidian_plant` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_plant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_task`
--

DROP TABLE IF EXISTS `yidian_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '任务名称',
  `task_parent_type` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'TRAFFIC' COMMENT '任务类型（父级类型）\nTRAFFIC是流量任务\nCOLLECT是收藏任务\nJD_SHOP_ATTENTION是店铺关注任务\nADD_CART是加购任务\nTB_LIVE是淘宝直播',
  `task_child_type` varchar(225) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'APP_TRAFFIC' COMMENT '任务类型（子类型）\n',
  `task_start_date` datetime NOT NULL COMMENT '任务开始日期',
  `task_baby_link_token` varchar(1024) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '宝贝链接或淘口令',
  `task_unit_price` int(11) NOT NULL DEFAULT '1' COMMENT '任务单价',
  `task_complete_type` int(11) NOT NULL DEFAULT '1' COMMENT '任务完成类型\n1是自动\n0是手动指定',
  `task_sum_money` int(11) NOT NULL DEFAULT '0' COMMENT '任务总金额',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '任务状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL COMMENT '任务最后一次更新时间',
  `task_user_id` int(11) NOT NULL COMMENT '任务用户id',
  `task_keyword` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '关键字',
  `task_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '任务数量',
  `task_search_url` varchar(110) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '搜索入口',
  `task_order_number` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '123456' COMMENT '任务订单号',
  `task_plant` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'TB' COMMENT '任务平台',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_task`
--

LOCK TABLES `yidian_task` WRITE;
/*!40000 ALTER TABLE `yidian_task` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_task_keyword_quantity`
--

DROP TABLE IF EXISTS `yidian_task_keyword_quantity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_task_keyword_quantity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_keyword` varchar(1024) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT ' 关键词',
  `task_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '任务数量',
  `task_id` int(11) NOT NULL COMMENT '任务id关联的是表 yidian_task表的id',
  `task_complete_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '任务完成已完成数量',
  `created_date` datetime DEFAULT NULL COMMENT '记录创建时间',
  `update_date` datetime DEFAULT NULL,
  `status` int(11) DEFAULT '1' COMMENT '任务状态\n 1是启用\n0是停用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='任务关键词和数量表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_task_keyword_quantity`
--

LOCK TABLES `yidian_task_keyword_quantity` WRITE;
/*!40000 ALTER TABLE `yidian_task_keyword_quantity` DISABLE KEYS */;
INSERT INTO `yidian_task_keyword_quantity` VALUES (1,'女装',1000,6,0,'2018-07-09 12:21:59',NULL,1),(2,'女装',10000,7,0,'2018-07-09 14:59:24',NULL,1),(3,'女装2',101,7,0,'2018-07-09 14:59:24',NULL,1),(4,'女装',1000,8,0,'2018-07-09 15:06:08',NULL,1);
/*!40000 ALTER TABLE `yidian_task_keyword_quantity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_task_type`
--

DROP TABLE IF EXISTS `yidian_task_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_task_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '名称',
  `plant` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '平台',
  `created_date` datetime NOT NULL COMMENT '创建时间',
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '状态 \n1是启用\n0是禁用',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `in_price` float NOT NULL COMMENT '进价',
  `out_price` float NOT NULL COMMENT '售价',
  `is_pc` int(2) NOT NULL COMMENT '1是pc\n2是app',
  `lieliu_code` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '列流code',
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '描述',
  `has_keyword` int(2) NOT NULL DEFAULT '1' COMMENT '是否有关键词\n1有\n0无',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_task_type`
--

LOCK TABLES `yidian_task_type` WRITE;
/*!40000 ALTER TABLE `yidian_task_type` DISABLE KEYS */;
INSERT INTO `yidian_task_type` VALUES (1,'APP搜索流量','TB','2018-11-03 10:10:17',1,'2018-11-05 11:58:07',4,19,0,'0','APP端',1),(2,'淘宝PC搜索流量','TB','2018-11-03 10:11:02',1,'2018-11-05 11:58:55',10,14,1,'1','PC端',1),(3,'淘宝直访店铺流量','TB','2018-11-03 10:12:38',1,'2018-11-05 11:59:09',10,14,1,'2','不限端口',0),(4,'淘宝PC直仿商品','TB','2018-11-03 10:13:32',1,'2018-11-05 11:59:25',10,14,1,'3','PC端',0),(5,'淘宝店铺收藏APP端','TB','2018-11-03 10:14:09',1,'2018-11-05 11:59:49',25,16,0,'6','APP端',0),(6,'淘宝商品收藏APP端','TB','2018-11-03 10:14:45',1,'2018-11-05 12:00:10',25,14,0,'7','APP端',0),(7,'淘宝搜索收藏APP端','TB','2018-11-03 10:16:05',1,'2018-11-05 12:00:23',29,35,0,'9','APP端',1),(8,'淘宝搜索加购APP端','TB','2018-11-03 10:16:42',1,'2018-11-05 12:00:35',44,32,1,'10','APP端',1),(9,'淘宝直接加购APP端','TB','2018-11-03 10:17:20',1,NULL,40,90,1,'11','APP端',0),(10,'淘宝直播关注','TB','2018-11-03 10:18:00',1,NULL,50,100,0,'12','APP端',0),(11,'微淘点赞','TB','2018-11-03 10:18:28',1,NULL,12,25,0,'13','APP端',0),(12,'淘宝直播观看','TB','2018-11-03 10:18:56',1,NULL,4,10,0,'14','APP端',0),(13,'淘宝开团提醒','TB','2018-11-03 10:19:19',1,NULL,4,10,0,'15','APP端',0),(14,'京东APP搜素流量','JD','2018-11-03 10:19:57',1,NULL,10,20,0,'71','APP端',1),(15,'京东APP商品收藏','JD','2018-11-03 10:20:24',1,NULL,35,70,0,'71','APP端',1),(16,'京东APP店铺关注','JD','2018-11-03 10:20:49',1,NULL,25,50,0,'72','APP端',0),(17,'京东APP加购','JD','2018-11-03 10:21:27',1,NULL,35,70,0,'73','APP端',1),(18,'京东达人关注','JD','2018-11-03 10:21:54',0,NULL,25,60,0,'74','APP端',1),(19,'京东预约抢购','JD','2018-11-03 10:22:21',0,NULL,35,70,0,'75','APP端',1),(20,'拼多多流量APP端','PDD','2018-11-03 10:22:46',1,NULL,1,10,0,'90','APP端',1),(21,'拼多多商品搜索收藏APP','PDD','2018-11-03 10:23:12',1,NULL,35,70,0,'91','APP端',1),(22,'拼多多商品直接收藏APP','PDD','2018-11-03 10:23:39',1,NULL,35,70,0,'92','APP端',0),(23,'拼多多店铺收藏APP','PDD','2018-11-03 10:24:02',1,NULL,35,70,0,'93','APP端',0);
/*!40000 ALTER TABLE `yidian_task_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_user`
--

DROP TABLE IF EXISTS `yidian_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 
CREATE TABLE `yidian_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户名',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `password` varchar(110) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '123456' COMMENT '用户密码',
  `level` int(11) NOT NULL DEFAULT '1' COMMENT '用户等级\n1是普通会员\n2是金牌会员',
  `is_super` int(11) NOT NULL DEFAULT '0' COMMENT '是否是超级管理员\n1是\n0不是',
  `created_date` datetime DEFAULT NULL COMMENT '创建用户时间',
  `money` int(225) NOT NULL DEFAULT '0' COMMENT '用户积分余额',
  `email` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户邮箱',
  `phone` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户电话',
  `QQ` varchar(45) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户QQ',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `salt` varchar(110) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT 'salt' COMMENT '用户密码加密盐',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_user`
--

LOCK TABLES `yidian_user` WRITE;
/*!40000 ALTER TABLE `yidian_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `yidian_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-11-07 15:31:54
