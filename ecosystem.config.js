"use strict";
module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     * 多个服务，依次放到apps对应的数组里
     */
    apps: [
        // First application
        {
            name: "yidiankeji",
            max_memory_restart: "4096M",
            script: "app.js",
            out_file: "./logs/out.log",
            error_file: "./logs/err.log",
            instances: 1,
            exec_mode: "cluster",
            node_args: "--max_old_space_size=4096",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};