-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: 127.0.0.1    Database: yidian
-- ------------------------------------------------------
-- Server version	5.7.10

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `yidian_logs_score`
--

DROP TABLE IF EXISTS `yidian_logs_score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_logs_score` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `status` int(2) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime NOT NULL,
  `user_name` varchar(45) COLLATE utf8_bin NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0' COMMENT '扣减或者充值的数量',
  `type` int(2) NOT NULL DEFAULT '1' COMMENT '日志类型\n充值1\n扣减0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_logs_score`
--

LOCK TABLES `yidian_logs_score` WRITE;
/*!40000 ALTER TABLE `yidian_logs_score` DISABLE KEYS */;
INSERT INTO `yidian_logs_score` VALUES (1,17,1,'2018-07-16 10:52:36','surongzhizhang',110000,1),(2,17,1,'2018-07-17 12:49:32','surongzhizhang',110000,1);
/*!40000 ALTER TABLE `yidian_logs_score` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_notice`
--

DROP TABLE IF EXISTS `yidian_notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `notice_title` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT 'title' COMMENT '通知标题',
  `notice_content` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT 'content' COMMENT '通知内容',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `task_order_number` varchar(45) COLLATE utf8_bin DEFAULT NULL COMMENT '任务订单号\n用于向远程服务器查找订单使用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_notice`
--

LOCK TABLES `yidian_notice` WRITE;
/*!40000 ALTER TABLE `yidian_notice` DISABLE KEYS */;
INSERT INTO `yidian_notice` VALUES (1,'玛丽亚','玛丽亚马上就累了！！！',1,'2018-07-12 22:25:01','2018-07-12 22:29:59',NULL),(2,'不知打','不知道你打的啊的啊等你',1,'2018-07-12 23:07:54',NULL,NULL),(3,'水珠送的','睡不好岁啊是啊的',1,'2018-07-12 23:08:03',NULL,NULL),(4,'放假通知','明天上班',1,'2018-07-16 16:34:49',NULL,NULL);
/*!40000 ALTER TABLE `yidian_notice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_package`
--

DROP TABLE IF EXISTS `yidian_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_package` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `package_name` varchar(110) COLLATE utf8_bin NOT NULL DEFAULT 'name' COMMENT '套餐名称',
  `package_present_score` int(225) NOT NULL DEFAULT '0' COMMENT '赠送积分',
  `package_purchase_score` int(225) NOT NULL DEFAULT '0' COMMENT '购买积分',
  `package_present_money` int(11) NOT NULL DEFAULT '0' COMMENT '赠送金额',
  `package_purchase_money` int(11) NOT NULL DEFAULT '0' COMMENT '购买金额',
  `package_pay_method` int(11) NOT NULL DEFAULT '0' COMMENT '支付方式\n0是支付宝和微信\n1是微信\n2是支付宝',
  `status` int(11) DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_package`
--

LOCK TABLES `yidian_package` WRITE;
/*!40000 ALTER TABLE `yidian_package` DISABLE KEYS */;
INSERT INTO `yidian_package` VALUES (1,'1000元（赠送100元）',10000,100000,100,2000,0,1,'2018-07-14 16:52:41','2018-07-14 17:33:06'),(2,'2000元（赠送500元）',10000,200000,500,2000,0,1,'2018-07-14 17:32:53',NULL),(3,'3000元（赠送800元）',20000,300000,800,3000,0,1,'2018-07-14 17:33:40',NULL),(4,'5000元（赠送1200元）',20000,500000,1200,5000,0,1,'2018-07-14 17:34:16',NULL),(5,'10000元（赠送2000元）',20000,2000000,2000,10000,0,1,'2018-07-14 17:34:50',NULL);
/*!40000 ALTER TABLE `yidian_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_plant`
--

DROP TABLE IF EXISTS `yidian_plant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_plant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plantname` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '平台名称',
  `description` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '平台描述',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态 \n1是启用 \n0是禁用',
  `created_date` datetime DEFAULT NULL COMMENT '创建时间',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='平台表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_plant`
--

LOCK TABLES `yidian_plant` WRITE;
/*!40000 ALTER TABLE `yidian_plant` DISABLE KEYS */;
INSERT INTO `yidian_plant` VALUES (1,'京东','多快好省！！！',1,'2018-07-07 23:03:24','2018-07-08 07:49:29'),(2,'淘宝','就够了！！！',1,'2018-07-08 07:09:16','2018-07-08 07:49:41'),(3,'拼多多','买假货，就上拼多多！！！',1,'2018-07-08 07:46:20',NULL),(4,'苏宁','苏宁不是我儿子！！！',1,'2018-07-09 08:44:24',NULL);
/*!40000 ALTER TABLE `yidian_plant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_task`
--

DROP TABLE IF EXISTS `yidian_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_name` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '任务名称',
  `task_parent_type` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT 'TRAFFIC' COMMENT '任务类型（父级类型）\nTRAFFIC是流量任务\nCOLLECT是收藏任务\nJD_SHOP_ATTENTION是店铺关注任务\nADD_CART是加购任务\nTB_LIVE是淘宝直播',
  `task_child_type` varchar(225) COLLATE utf8_bin NOT NULL DEFAULT 'APP_TRAFFIC' COMMENT '任务类型（子类型）\n',
  `task_start_date` datetime NOT NULL COMMENT '任务开始日期',
  `task_baby_link_token` varchar(1024) COLLATE utf8_bin NOT NULL DEFAULT 'N/A' COMMENT '宝贝链接或淘口令',
  `task_unit_price` int(11) NOT NULL DEFAULT '1' COMMENT '任务单价',
  `task_complete_type` int(11) NOT NULL DEFAULT '1' COMMENT '任务完成类型\n1是自动\n0是手动指定',
  `task_sum_money` int(11) NOT NULL DEFAULT '0' COMMENT '任务总金额',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '任务状态\n1是启用\n0是禁用',
  `created_date` datetime DEFAULT NULL,
  `update_date` datetime DEFAULT NULL COMMENT '任务最后一次更新时间',
  `task_user_id` int(11) NOT NULL COMMENT '任务用户id',
  `task_keyword` varchar(255) COLLATE utf8_bin DEFAULT NULL COMMENT '关键字',
  `task_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '任务数量',
  `task_search_url` varchar(110) COLLATE utf8_bin DEFAULT NULL COMMENT '搜索入口',
  `task_order_number` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT '123456' COMMENT '任务订单号',
  `task_plant` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT 'TB' COMMENT '任务平台',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_task`
--

LOCK TABLES `yidian_task` WRITE;
/*!40000 ALTER TABLE `yidian_task` DISABLE KEYS */;
INSERT INTO `yidian_task` VALUES (10,'测试数据1','TRFFIC','PC_SEARCH','2018-07-13 00:00:00','https://item.taobao.com/item.htm?spm=a211pk.steins68998.wb-qs-fp-20180312-ruiyu-video-pc6.3.129fjVNljVNl6G&id=39878007598',30,1,720,1,'2018-07-13 11:04:00',NULL,1,'小龙虾',24,NULL,'20180713110359242532','TB');
/*!40000 ALTER TABLE `yidian_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yidian_task_keyword_quantity`
--

DROP TABLE IF EXISTS `yidian_task_keyword_quantity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_task_keyword_quantity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_keyword` varchar(1024) COLLATE utf8_bin NOT NULL COMMENT ' 关键词',
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
-- Table structure for table `yidian_user`
--

DROP TABLE IF EXISTS `yidian_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `yidian_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(45) COLLATE utf8_bin NOT NULL COMMENT '用户名',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '数据状态\n1是启用\n0是禁用',
  `password` varchar(110) COLLATE utf8_bin NOT NULL DEFAULT '123456' COMMENT '用户密码',
  `level` int(11) NOT NULL DEFAULT '1' COMMENT '用户等级\n1是普通会员\n2是金牌会员',
  `is_super` int(11) NOT NULL DEFAULT '0' COMMENT '是否是超级管理员\n1是\n0不是',
  `created_date` datetime DEFAULT NULL COMMENT '创建用户时间',
  `money` int(225) NOT NULL DEFAULT '0' COMMENT '用户积分余额',
  `email` varchar(45) COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户邮箱',
  `phone` varchar(45) COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户电话',
  `QQ` varchar(45) COLLATE utf8_bin DEFAULT 'N/A' COMMENT '用户QQ',
  `update_date` datetime DEFAULT NULL COMMENT '更新时间',
  `salt` varchar(110) COLLATE utf8_bin NOT NULL DEFAULT 'salt' COMMENT '用户密码加密盐',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yidian_user`
--

LOCK TABLES `yidian_user` WRITE;
/*!40000 ALTER TABLE `yidian_user` DISABLE KEYS */;
INSERT INTO `yidian_user` VALUES (17,'surongzhizhang',1,'$2b$12$cZCOe/ZdmUynEG2fh9RJke2mfB0/lvmCG8D96odmeY/eTRgm2iZC.',2,1,'2018-07-14 12:48:10',3199000,'','','',NULL,'$2b$12$cZCOe/ZdmUynEG2fh9RJke'),(18,'surongc',1,'$2b$12$q3yql0POL/DFPLNbGHc/le53jF59nNyIhdDKnNFl84DIHIJyF496a',1,0,'2018-07-16 11:39:04',0,'keepFur@163.com','18098971690','838472035',NULL,'$2b$12$q3yql0POL/DFPLNbGHc/le'),(19,'linyuan',1,'$2b$12$LF.mEc1vVn8fdRog9iqQUeIHVhZFYQ8ZGJyQbwBEyx6EHeWYxTXuq',1,0,'2018-07-16 16:23:56',0,'keepFur@163.com','18098971690','838472035',NULL,'$2b$12$LF.mEc1vVn8fdRog9iqQUe'),(20,'linyuanz',1,'$2b$12$1xX1ew4W1/7r9u52DvgjMetzIQ8ZY/xFZHJ8XtwZZuyYril/Urb6a',1,0,'2018-07-16 16:41:31',0,'aenjoy@126.com','18098971690','2460581061',NULL,'$2b$12$1xX1ew4W1/7r9u52DvgjMe'),(21,'',0,'$2b$12$w25lf1y5K3kJpx8NCvlixu.UANqx9Nxp9OQm9JFUrzOCJzSipzW.u',1,0,'2018-07-16 18:31:12',0,'','','',NULL,'$2b$12$w25lf1y5K3kJpx8NCvlixu'),(22,'surongceshi',1,'$2b$12$3intgS7EhnaLA4vXbPPs/uB6.10KVKsYF.QCAaXls3ZT2HDy2eEAW',1,0,'2018-07-16 18:34:14',0,'keepFur@163.com','18098971690','838472035',NULL,'$2b$12$3intgS7EhnaLA4vXbPPs/u');
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

-- Dump completed on 2018-07-17 15:53:08
