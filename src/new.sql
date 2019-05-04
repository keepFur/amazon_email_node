CREATE TABLE `yidian`.`yidian_present` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '产品id',
  `name` VARCHAR(200) NOT NULL COMMENT '名称',
  `img` VARCHAR(10000) NOT NULL COMMENT '图片',
  `price` DOUBLE NOT NULL COMMENT '价格',
  `status` INT NULL DEFAULT 1 COMMENT '状态',
  `created_date` DATETIME NULL COMMENT '创建时间',
  `update_date` DATETIME NULL COMMENT '最后更新时间',
  `pid` VARCHAR(45) NOT NULL COMMENT '产品id',
  PRIMARY KEY (`id`));
CREATE TABLE `yidian`.`yidian_present_stock` (
  `id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL COMMENT '仓库名称',
  `created_date` DATETIME NULL,
  `update_date` DATETIME NULL,
  `status` INT NULL COMMENT '状态',
  PRIMARY KEY (`id`));

CREATE TABLE `yidian`.`yidian_present_set` (
  `id` INT NOT NULL,
  `user_id` INT(10) NOT NULL,
  `from_name` VARCHAR(45) NOT NULL COMMENT '发件人姓名',
  `from_phone` VARCHAR(45) NOT NULL COMMENT '发件人电话',
  `created_date` DATETIME NULL,
  `update_date` DATETIME NULL,
  PRIMARY KEY (`id`));
