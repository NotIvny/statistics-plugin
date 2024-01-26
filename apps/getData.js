import fs from "fs";
import moment from "moment";
let path = './plugins/statistics-plugin/config/stats.json';
let cwd = process.cwd().replace(/\\/g, '/')
export async function getData(groupid,userid) {
    // 读数据
    let statsData;
    try {
        statsData = JSON.parse(fs.readFileSync(path, 'utf-8'));
    } catch (error) {
        console.log(error);
        return false;
    }

    // 用于网页的数据
    let commandUsage24 = Array.from({ length: 24 }, (_, index) => {
        let hour = moment().subtract(index, 'hours').format('YYYYMMDDHH');
        return statsData[groupid] && statsData[groupid][hour] ? statsData[groupid][hour] : 0;
    });

    let timePoints24 = Array.from({ length: 24 }, (_, index) => {
        let fullHour = moment().subtract(index, 'hours');
        return fullHour.format('MM/DD HH:00');
    });
    let maxCommandUsage = Math.max(...commandUsage24);
    //处理标题
    if(groupid == "Total"){
        groupid = '全局';
    }else{
        groupid = ('群' + groupid);
    }
    return {
        tplFile: `${cwd}/plugins/statistics-plugin/resources/stats.html`,
        pluResPath: `${cwd}/plugins/statistics-plugin/resources/`,
        userid: userid,
        commandUsageLast24Hours: commandUsage24,
        timePointsLast24Hours: timePoints24,
        maxCommandUsage: maxCommandUsage,
        groupid: groupid,
    };
}
