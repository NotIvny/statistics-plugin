import fs from "fs";
import moment from "moment";
import plugin from '../../../lib/plugins/plugin.js';
let path = './plugins/statistics-plugin/config/stats.json';
export class stats extends plugin {
    constructor() {
        super({
            name: '命令触发判断',
            dsc: '命令触发判断',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '^(.*)$',
                    fnc: 'check',
                }
            ]
        });
    }
    async check(e){
        if(this.e.isPrivate){
            return false;
        }
        let groupid = e.group_id;
        let time = moment().format('YYYYMMDDHH');
        let statsData;

        try {
            // 读文件
            statsData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        } catch (error) {
            statsData = {};
        }

        // 计数器
        statsData['Total'] = statsData['Total'] || {};
        statsData['Total'][time] = (statsData['Total'][time] || 0) - 1;
        fs.writeFileSync(path, JSON.stringify(statsData, null, 2));
        // 删除24h前的数据
        let cutoffTime = moment().subtract(24, 'hours').format('YYYYMMDDHH');
        for (let key in statsData) {
            if (key < cutoffTime) {
                delete statsData[key];
            }
        }
        statsData[groupid] = (statsData[groupid] || {});
        statsData[groupid][time] = (statsData[groupid][time] || 0) - 1;
        fs.writeFileSync(path, JSON.stringify(statsData , null, 2));
        return false;
    }
}