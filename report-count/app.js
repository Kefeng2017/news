const request = require('superagent');
require('superagent-charset')(request);
const cheerio = require('cheerio');
const Koa = require('koa');
const Router = require('koa-router');
const db = require('./db');
const schedule = require('node-schedule');
const app = new Koa();
const router = new Router();
const req = require('request');

app.context.db = db;

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Headers', '*');
    ctx.set('Access-Control-Allow-Origin', '*');
    await next();
})
/**
 * 获取新闻接口
 * query page
 *  */
router.get('/', async ctx => {
    try {
        const page = ctx.query.page;
        const findNews = await ctx.db.query(
            "select * from news order by c_date desc limit ?,20",
            [20 * page]
        );
        const count = await ctx.db.query(
            "select count(id) from news"
        );
        const source = await ctx.db.query(
            "select source, count(*) from news group by source"
        );
        if (findNews.length > 0) {
            ctx.status = 200;
            ctx.body = { news: findNews, count, source, page };
        } else {
            ctx.status = 201;
            ctx.body = { msg: "暂无更新或获取数据失败" };
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
});

router.get('/ip', async ctx => {
    try {
        const ip = ctx.query.ip;
        const addr = ctx.query.addr;

        const saveIp = await ctx.db.query(
            "insert into visitor set ip = ?, addr = ? ",
            [ip, addr]
        );
        if (saveIp.affectedRows > 0) {
            ctx.body = { msg: "success" };
            ctx.status = 200;
        } else {
            ctx.body = { msg: "db err" };
            ctx.status = 500;
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
});

router.get('/school', async ctx => {
    try {
        const page = parseInt(ctx.query.page);

        const getSchool = await ctx.db.query(
            "select * from school limit ?,50",
            [page]
        );
        if (getSchool.length > 0) {
            ctx.body = { msg: "success", school: getSchool };
            ctx.status = 200;
        } else {
            ctx.body = { msg: "db err" };
            ctx.status = 500;
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
});

router.get('/company', async ctx => {
    try {
        const page = parseInt(ctx.query.page);

        const getCompany = await ctx.db.query(
            "SELECT name,short_name,english_name,LEFT(description,30) as description FROM company LIMIT ?,50;",
            [page]
        );
        if (getCompany.length > 0) {
            ctx.body = { msg: "success", company: getCompany };
            ctx.status = 200;
        } else {
            ctx.body = { msg: "db err" };
            ctx.status = 500;
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
});

router.get('/product', async ctx => {
    try {
        const page = parseInt(ctx.query.page);

        const getProduct = await ctx.db.query(
            "select * from product limit ?,50",
            [page]
        );
        if (getProduct.length > 0) {
            ctx.body = { msg: "success", product: getProduct };
            ctx.status = 200;
        } else {
            ctx.body = { msg: "db err" };
            ctx.status = 500;
        }
    } catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
});

router.get('/vote', async ctx =>{
    try {
        const id = ctx.query.id;
        // 有id走队伍
        if(id){
            const getTeam = await ctx.db.query(
                "select * from team where number = ? limit 24",
                [id]
            );
            if(getTeam.length>0){
                ctx.status = 200;
                ctx.body = {msg: "success", voteList:getTeam};
            }
            // 没id走所有
        }else{
            const getVote = await ctx.db.query(
                "select * from team order by f_date desc limit 17",
            );
            if (getVote.length > 0) {
                ctx.body = { msg: "success", list: getVote };
                ctx.status = 200;
            } else {
                ctx.body = { msg: "db err" };
                ctx.status = 200;
            }
        }
    } catch (e) {
        ctx.status = 500;
        ctx.body = { msg: "崩了" };
    }
})

app.use(router.routes()).use(router.allowedMethods());
app.listen(9999, () => {
    console.log('app id running on port 9999');
});


// //新浪新闻 每分钟刷新一次
// const xinlang = function scheduleCronstyle() {
//     schedule.scheduleJob('* 10 * * * *', function () {

//         try {
//             const url1 = 'https://search.sina.com.cn/?q=%B5%E7%BE%BA&range=title&c=news&sort=time&col=&source=&from=&country=&size=&time=&a=&page=%d&pf=0&ps=0&dpc=1'
//             for (var i = 2; i < 11; i++) {
//                 var url = util.format(url1, i);
//                 request.get(url).
//                     set({
//                         'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
//                         'referer': util.format(url1, i - 1),
//                         'cookie': 'SINAGLOBAL=10.79.229.20_1547986098.650327; SCF=Ar8sNV30PJ7UmgWFsKphEij9JwPbrrSMCMaDAjRhXihsKSuRf_Y8ydcQs9C6haeH4qGI978s6dvD0m-nSEKTmSM.; sso_info=v02m6alo5qztKWRk6SljoOIpZCjgKWRk6SljpOkpY6DmKWRk5iljpOYpY6TnKadlqWkj5OYuI6DgLiNk4S1jpOYwA==; U_TRS1=00000024.387c4b08.5ca5c514.9a6fbb1c; U_TRS2=00000024.38884b08.5ca5c514.0463fc01; UOR=www.google.com,blog.sina.com.cn,; Apache=119.103.220.193_1554367767.983038; ULV=1554738567146:2:2:1:119.103.220.193_1554367767.983038:1554367732964; lxlrttp=1554343419'
//                     })
//                     .charset('gb2312').end((err, res) => {
//                         if (err) {
//                             console.log(err);
//                             return;
//                         }
//                         let $ = cheerio.load(res.text);
//                         $("#result>.box-result").each(async (i, elem) => {

//                             var url = await $(elem).find('h2').find('a').attr('href');
//                             var t_title = await $(elem).find('h2').find('a').text();
//                             var title = await t_title.replace(/\n/g, '').replace(/\s/g, '');
//                             var other = await $(elem).find('h2').find('span').text().split(' ');
//                             var author = other[0];
//                             var date = other[1] + ' ' + other[2]

//                             if (title && url) {
//                                 const a = await db.query(
//                                     "select * from news where id =? or title=?",
//                                     [url, title]
//                                 );
//                                 if (a.length > 0) return true;
//                                 else {
//                                     var item = [url, title, author, date, '新浪新闻', url];

//                                     const b = await db.query(
//                                         "insert into news (id,title,author,c_date,source,url) values(?,?,?,?,?,?) ",
//                                         item,
//                                         function (err, data) {
//                                             if (err) {
//                                                 // console.log(err);
//                                                 console.log("数据库错误");
//                                             }
//                                         }
//                                     );

//                                 }
//                             }
//                         });
//                     })
//             }
//         } catch (e) {
//             // console.log(e);
//         }
//     });
// }

// //今日头条 每分钟刷新一次
// const toutiao = function scheduleCronstyle() {
//     schedule.scheduleJob('* 10 * * * *', function () {
//         try {
//             //今日头条
//             const time = new Date().getTime();
//             const url2 = 'https://www.toutiao.com/api/search/content/?aid=24&app_name=web_search&offset=0&format=json&keyword=%E7%94%B5%E7%AB%9E&autoload=true&count=20&en_qc=1&cur_tab=1&from=search_tab&pd=synthesis&timestamp=%d'
//             var url = util.format(url2, time)
//             request.get(url).end(async (err, res) => {
//                 if (err) {
//                     // console.log(err);
//                     return;
//                 }
//                 var res_json = JSON.parse(res.text);
//                 var data = res_json.data;
//                 for (var i = 0; i < data.length; i++) {
//                     //去除非新闻内容
//                     if (data[i].title && data[i].id) {
//                         const a = await db.query(
//                             "select * from news where id =? or title=?",
//                             [data[i].id, data[i].title]
//                         );
//                         if (a.length > 0) continue;
//                         else {
//                             var item = [
//                                 data[i].id,
//                                 data[i].title,
//                                 data[i].media_name,
//                                 data[i].datetime,
//                                 "今日头条",
//                                 data[i].article_url
//                             ];
//                             db.query(
//                                 "insert into news (id,title,author,c_date,source,url) values(?,?,?,?,?,?) ",
//                                 item,
//                                 function (err, data) {
//                                     if (err) {
//                                         console.log("数据库错误");
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                 }
//             });
//         } catch (e) {
//             // console.log(e);
//         }
//     });
// }

// // 腾讯新闻 每分钟刷新
// const tengxun = function scheduleCronstyle() {
//     schedule.scheduleJob('* 30 * * * *', function () {

//         try {
//             //分析：腾讯新闻获取数据每三条一次请求，下一次请求需要expids参数，即上一次请求获取的三条数据的id
//             //先发送第一次请求，不需要expids参数
//             const url_first = 'https://pacaio.match.qq.com/irs/rcd?cid=52&token=8f6b50e1667f130c10f981309e1d8200&ext=%201022,1007,1009,1010,1011,1013,1014,1015,1016,1017,1018,1019,1020&page=0&isForce=1&expIds=&callback=__jp0';
//             //获取expids 方法
//             const get_exid = (data) => {
//                 var str = '';
//                 for (var i = 0; i < data.length; i++) {
//                     if (data[i].app_id.length > 16) {
//                         data[i].app_id = data[i].app_id.slice(3);
//                     }
//                     str += data[i].app_id.slice(0, -2) + '|';
//                 }
//                 return str.slice(0, -1);
//             };
//             //预处理第一次请求
//             request.get(url_first).end(async (err, res) => {
//                 if (err) {
//                     console.log(err);
//                     return;
//                 }
//                 const result = res.body.replace(/__jp[0-9]*/g, '').slice(1, -1);
//                 // console.log(result);
//                 const res_json = JSON.parse(result);
//                 const items = res_json.data;
//                 var exid = get_exid(items);

//                 //第一次保存数据
//                 for (var i = 0; i < items.length; i++) {
//                     const a = await db.query(
//                         "select * from news where id =? or title=?",
//                         [items[i].id, items[i].title]
//                     );
//                     if (a.length > 0) continue;
//                     else {
//                         const item = [
//                             items[i].id,
//                             items[i].title,
//                             items[i].source,
//                             items[i].publish_time,
//                             "腾讯新闻",
//                             items[i].url,
//                         ];
//                         // console.log(item);
//                         db.query(
//                             "insert into news (id,title,author,c_date,source,url) values(?,?,?,?,?,?) ",
//                             item,
//                             function (err, data) {
//                                 if (err) {
//                                     console.log(err);
//                                     console.log("数据库错误");
//                                 }
//                             }
//                         );
//                     }
//                 }

//                 const url4 = 'https://pacaio.match.qq.com/irs/rcd?cid=52&token=8f6b50e1667f130c10f981309e1d8200&ext=%201022,1007,1009,1010,1011,1013,1014,1015,1016,1017,1018,1019,1020&page=%d&isForce=1&expIds=%s&callback=__jp%d'
//                 for (var i = 1; i < 11; i++) {
//                     var url = util.format(url4, i, exid, i + 5);
//                     request.get(url).
//                         set({
//                             'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
//                         }).end(async (err, res) => {
//                             if (err) {
//                                 console.log(err);
//                                 return;
//                             }
//                             const result2 = res.body.replace(/__jp[0-9]*/g, '').slice(1, -1);
//                             // console.log(result);
//                             const res_json2 = JSON.parse(result2);
//                             const items2 = res_json2.data;
//                             exid = get_exid(items2);
//                             // console.log(items);
//                             for (var i = 0; i < items2.length; i++) {
//                                 const a = await db.query(
//                                     "select * from news where id =? or title=?",
//                                     [items2[i].id, items2[i].title]
//                                 );
//                                 if (a.length > 0) continue;
//                                 else {
//                                     const item2 = [
//                                         items2[i].id,
//                                         items2[i].title,
//                                         items2[i].source,
//                                         items2[i].publish_time,
//                                         "腾讯新闻",
//                                         items2[i].url
//                                     ];


//                                     const save = await db.query(
//                                         "insert into news (id,title,author,c_date,source,url) values(?,?,?,?,?,?) ",
//                                         item2,
//                                         function (err, data) {
//                                             if (err) {
//                                                 console.log(err);
//                                                 console.log("数据库错误");
//                                             }
//                                         }
//                                     );
//                                 }
//                             }
//                         });
//                 }
//             })
//         } catch (e) {
//             console.log(e);
//         }
//     });
// }


// // 搜狐新闻 每分钟刷新
// const souhu = function scheduleCronstyle() {
//     schedule.scheduleJob('20 * * * * *', function () {

//         try {
//             //搜狐新闻
//             const url5 = 'http://v2.sohu.com/public-api/feed?scene=CATEGORY&sceneId=1361&page=%d&size=20&callback=jQuery1124034431425551877504_%d&_=%d';
//             for (var i = 1; i < 200; i++) {
//                 var time = new Date().getTime();
//                 // console.log(time);
//                 var url = util.format(url5, i, time, parseInt(time + 123));
//                 // console.log(url);
//                 req(url, { json: true }, async (err, res, body) => {
//                     if (err) {
//                         console.log(err);
//                         return;
//                     }
//                     var temp = res.body;
//                     var str = temp.replace(/\/\*\*\/jQuery\w*\(/g, '').slice(0, -2);
//                     var result = JSON.parse(str);
//                     // console.log(result);

//                     for (var j = 0; j < result.length; j++) {
//                         // console.log(result[j].originalSource);
//                         //去除非新闻内容
//                         if (result[j].title && result[j].id) {
//                             const a = await db.query(
//                                 "select * from news where id =? or title=?",
//                                 [result[j].id, result[j].title]
//                             );
//                             if (a.length > 0) continue;
//                             else {
//                                 const url = result[j].originalSource || 'http://www.sohu.com/a/' + result[j].id + '_' + result[j].authorId;
//                                 var item = [
//                                     result[j].id,
//                                     result[j].title,
//                                     result[j].authorName,
//                                     format(result[j].publicTime),
//                                     "搜狐新闻",
//                                     url
//                                 ];
//                                 // console.log(item);
//                                 db.query(
//                                     "insert into news (id,title,author,c_date,source,url) values(?,?,?,?,?,?) ",
//                                     item,
//                                     function (err, data) {
//                                         if (err) {
//                                             console.log(err);
//                                             console.log("数据库错误");
//                                         }
//                                     }
//                                 );
//                             }
//                         }
//                     }

//                 });
//             }

//         } catch (e) {
//             // console.log(e);
//         }

//     });
// }



// watch 投票监控
const watch1 = function scheduleCronstyle() {
    schedule.scheduleJob('0 20 * * * *', function () {
        try {

            const url6 = 'http://cdjcvote.lz.net.cn/?sort=top';
            var time = new Date().getTime();
            var f_date = format(time);
            req(url6, async (err, res, body) => {
                if (err) {
                    console.log(err);
                    return;
                }
                var temp = res.body;
                let $ = cheerio.load(temp);
                $(".clearfix>.listpro").each(async (i, elem) => {

                    var aLink = await $(elem).find($('.boxd')).find('a');
                    var url = aLink.attr('href');
                    var desc = aLink.text().split('\t');
                    var title = desc[2];
                    var school = desc[0];
                    var team = desc[1];
                    var number = await $(elem).find('i').text();
                    var vote = await $(elem).find('b').text();
                    // console.log(url, desc, number, vote);

                    if (title && url && vote && number) {
                        const a = await db.query(
                            "select * from news where id =? or title=?",
                            [url, title]
                        );
                        if (a.length > 0) return true;
                        else {
                            var item = [url, title, school, team, number, vote, f_date];

                            const b = await db.query(
                                "insert into team (url,title,school,team,number,vote,f_date) values(?,?,?,?,?,?,?) ",
                                item,
                                function (err, data) {
                                    if (err) {
                                        console.log("数据库错误");
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('err');
                    }

                })
            })

        } catch (e) {
            // console.log(e);
        }

    });
}

const watch2 = function scheduleCronstyle() {
    schedule.scheduleJob('0 40 * * * *', function () {
        try {

            const url6 = 'http://cdjcvote.lz.net.cn/?sort=top';
            var time = new Date().getTime();
            var f_date = format(time);
            req(url6, async (err, res, body) => {
                if (err) {
                    console.log(err);
                    return;
                }
                var temp = res.body;
                let $ = cheerio.load(temp);
                $(".clearfix>.listpro").each(async (i, elem) => {

                    var aLink = await $(elem).find($('.boxd')).find('a');
                    var url = aLink.attr('href');
                    var desc = aLink.text().split('\t');
                    var title = desc[2];
                    var school = desc[0];
                    var team = desc[1];
                    var number = await $(elem).find('i').text();
                    var vote = await $(elem).find('b').text();
                    // console.log(url, desc, number, vote);

                    if (title && url && vote && number) {
                        const a = await db.query(
                            "select * from news where id =? or title=?",
                            [url, title]
                        );
                        if (a.length > 0) return true;
                        else {
                            var item = [url, title, school, team, number, vote, f_date];

                            const b = await db.query(
                                "insert into team (url,title,school,team,number,vote,f_date) values(?,?,?,?,?,?,?) ",
                                item,
                                function (err, data) {
                                    if (err) {
                                        console.log("数据库错误");
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('err');
                    }

                })
            })

        } catch (e) {
            // console.log(e);
        }

    });
}

const watch3 = function scheduleCronstyle() {
    schedule.scheduleJob('0 59 * * * *', function () {
        try {

            const url6 = 'http://cdjcvote.lz.net.cn/?sort=top';
            var time = new Date().getTime();
            var f_date = format(time);
            req(url6, async (err, res, body) => {
                if (err) {
                    console.log(err);
                    return;
                }
                var temp = res.body;
                let $ = cheerio.load(temp);
                $(".clearfix>.listpro").each(async (i, elem) => {

                    var aLink = await $(elem).find($('.boxd')).find('a');
                    var url = aLink.attr('href');
                    var desc = aLink.text().split('\t');
                    var title = desc[2];
                    var school = desc[0];
                    var team = desc[1];
                    var number = await $(elem).find('i').text();
                    var vote = await $(elem).find('b').text();
                    // console.log(url, desc, number, vote);

                    if (title && url && vote && number) {
                        const a = await db.query(
                            "select * from news where id =? or title=?",
                            [url, title]
                        );
                        if (a.length > 0) return true;
                        else {
                            var item = [url, title, school, team, number, vote, f_date];

                            const b = await db.query(
                                "insert into team (url,title,school,team,number,vote,f_date) values(?,?,?,?,?,?,?) ",
                                item,
                                function (err, data) {
                                    if (err) {
                                        console.log("数据库错误");
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('err');
                    }

                })
            })

        } catch (e) {
            // console.log(e);
        }

    });
}

// souhu();
// toutiao();
// xinlang();
// tengxun();
watch1();
watch2();
watch3();



function format(timestamp) {

    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

    var Y = date.getFullYear() + '-';

    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';

    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';

    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';

    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';

    var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

    return Y + M + D + h + m + s;

}

