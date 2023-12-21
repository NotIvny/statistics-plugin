import fs from "fs";
import moment from "moment";
import plugin from '../../../lib/plugins/plugin.js';
import {getData} from './getData.js';
import puppeteer from '../../../lib/puppeteer/puppeteer.js';
let path = './plugins/statistics-plugin/config/stats.json';
export class statsbefore extends plugin {
    constructor() {
        super({
            name: '命令统计',
            dsc: '命令统计',
            event: 'message',
            priority: -4000,
            rule: [
                {
                    reg: '^(.*)$',
                    fnc: 'statistics',
                },
                {
                    reg:'^#命令统计',
                    fnc: 'showstats',
                }
            ]
        });
    }
    async statistics(e) {
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
        statsData['Total'][time] = (statsData['Total'][time] || 0) + 1;
        fs.writeFileSync(path, JSON.stringify(statsData, null, 2));
        // 删除24h前的数据
        let cutoffTime = moment().subtract(24, 'hours').format('YYYYMMDDHH');
        for (let key in statsData) {
            if (key < cutoffTime) {
                delete statsData[key];
            }
        }
        statsData[groupid] = (statsData[groupid] || {});
        statsData[groupid][time] = (statsData[groupid][time] || 0) + 1;
        fs.writeFileSync(path, JSON.stringify(statsData , null, 2));
        return false;
    }
    async showstats(e){
        let userid = e.user_id;
        let groupid = e.group_id;
        const group = this.e.msg.replace("#命令统计", "").trim();
        let data;
        if(group == ""){
            data = await getData(groupid,userid);
        }else if(!e.isMaster){
            return false;
        }else if(group > 0 && group < 1000000000){
            data = await getData(group,userid);
        }else if(group == '全局'){
            data = await getData('Total',userid);
        }else{
            e.reply('群号错误');
            return false;
        }
        // 渲染图片
        let img = await puppeteer.screenshot('statistics-plugin', data);
        await e.reply(img);
    }
}
