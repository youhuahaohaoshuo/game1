var memberType = GetQueryString('memberType')
var parentId = GetQueryString('parentId')
var giftId = GetQueryString('giftId')
var rankMemberId = ''
function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) {
        return r[2]
    } else {
        return null
    }
}
// history.replaceState({}, '', window.location.href.replace('memberType=1', 'memberType=2'))
function Ship(ctx) {
    gameMonitor.im.loadImage(['./img/dragon.png']);
    this.width = 86;
    this.height = 86;
    this.left = gameMonitor.w / 2 - this.width / 2;
    this.top = gameMonitor.h - 2 * this.height;
    this.player = gameMonitor.im.createImage('./img/dragon.png');

    this.paint = function () {
        ctx.drawImage(this.player, this.left, this.top, this.width, this.height);
    }

    this.setPosition = function (event) {
        if (gameMonitor.isMobile()) {
            var tarL = event.changedTouches[0].clientX;
            var tarT = event.changedTouches[0].clientY;
        }
        else {
            var tarL = event.offsetX;
            var tarT = event.offsetY;
        }
        this.left = tarL - this.width / 2 - 16;
        this.top = tarT - this.height / 2;
        if (this.left < 0) {
            this.left = 0;
        }
        if (this.left > gameMonitor.w - this.width) {
            this.left = gameMonitor.w - this.width;
        }
        if (this.top < 0) {
            this.top = 0;
        }
        if (this.top > gameMonitor.h - this.height) {
            this.top = gameMonitor.h - this.height;
        }
        this.paint();
    }

    this.controll = function () {
        var _this = this;
        var stage = $('#gamepanel');
        var currentX = this.left,
            currentY = this.top,
            move = false;
        stage.on(gameMonitor.eventType.start, function (event) {
            _this.setPosition(event);
            move = true;
        }).on(gameMonitor.eventType.end, function () {
            move = false;
        }).on(gameMonitor.eventType.move, function (event) {
            event.preventDefault();
            if (move) {
                _this.setPosition(event);
            }

        });
    }

    this.eat = function (foodlist) {
        for (var i = foodlist.length - 1; i >= 0; i--) {
            var f = foodlist[i];
            if (f) {
                var l1 = this.top + this.height / 2 - (f.top + f.height / 2);
                var l2 = this.left + this.width / 2 - (f.left + f.width / 2);
                var l3 = Math.sqrt(l1 * l1 + l2 * l2);
                if (l3 <= this.height / 2 + f.height / 2) {
                    foodlist[f.id] = null;
                    if (f.type == 3) {
                        console.log(gameMonitor.score)
                        gameMonitor.stop();
                        $('#gamepanel').unbind()
                        $('#gamepanel').hide()
                        if (memberType == 1) {
                            $.post('https://www.topasst.com/web/game/submitInfo', {
                                memberType: memberType,
                                giftId: giftId,
                                parentId: parentId,
                                score: gameMonitor.score
                            }, function (res) {
                                if (res.statusCode === 200) {
                                    getRankList(parentId)
                                    $('#rankPlay').show()
                                    $('#rankTitle').show()
                                    $('#rankPage').show()
                                    $('#rankBack').hide()
                                    history.replaceState({}, '', window.location.href.replace('memberType=1', 'memberType=2'))
                                }
                            })
                        } else {
                            $('#resultPanel').show()
                        }
                    }
                    else {
                        if (f.type == 1) {
                            gameMonitor.score += 30
                        } else if (f.type == 2) {
                            gameMonitor.score += 50
                        } else {
                            gameMonitor.score += 10
                        }
                        $('#score').text(gameMonitor.score);
                    }
                }
            }

        }
    }
}
function Food(type, left, id) {
    this.speedUpTime = 300;
    this.id = id;
    this.type = type;
    this.width = 55;
    this.height = 53;
    this.left = left;
    this.top = -50;
    this.speed = 0.04 * Math.pow(1.2, Math.floor(gameMonitor.time / this.speedUpTime));
    this.loop = 0;
    var p = './img/yb.png'
    switch (this.type) {
        case 0:
            p = './img/gift__01.png'
            this.width = 57;
            this.height = 67;
            break;
        case 1:
            p = './img/gift_02.png'
            this.width = 69;
            this.height = 73;
            break;
        case 2:
            p = './img/gift_03.png'
            this.width = 64;
            this.height = 75;
            break;
        case 3:
            p = './img/gift_04.png'
            this.width = 65;
            this.height = 75;
            break;
        default:
            break;
    }
    this.pic = gameMonitor.im.createImage(p);
}
Food.prototype.paint = function (ctx) {
    ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function (ctx) {
    if (gameMonitor.time % this.speedUpTime == 0) {
        this.speed *= 1.2;
    }
    this.top += ++this.loop * this.speed;
    if (this.top > gameMonitor.h) {
        gameMonitor.foodList[this.id] = null;
    }
    else {
        this.paint(ctx);
    }
}
function ImageMonitor() {
    var imgArray = [];
    return {
        createImage: function (src) {
            return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
        },
        loadImage: function (arr, callback) {
            for (var i = 0, l = arr.length; i < l; i++) {
                var img = arr[i];
                imgArray[img] = new Image();
                imgArray[img].onload = function () {
                    if (i == l - 1 && typeof callback == 'function') {
                        callback();
                    }
                }
                imgArray[img].src = img
            }
        }
    }
}
var gameMonitor = {
    w: 320,
    h: 568,
    bgWidth: 320,
    bgHeight: 1126,
    time: 0,
    timmer: null,
    bgSpeed: 2,
    bgloop: 0,
    score: 0,
    im: new ImageMonitor(),
    foodList: [],
    bgDistance: 0,//背景位置
    eventType: {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
    },
    init: function () {
        var _this = this;
        var canvas = document.getElementById('stage');
        var ctx = canvas.getContext('2d');
        var bodyWidth = document.getElementById('gamepanel').clientWidth
        var bodyHeight = document.getElementById('gamepanel').clientHeight
        console.log(bodyHeight)
        canvas.width = bodyWidth
        canvas.height = bodyHeight
        //绘制背景
        _this.w = bodyWidth
        _this.h = bodyHeight
        _this.bgWidth = bodyWidth
        _this.bgHeight = bodyHeight
        var bg = new Image();
        _this.bg = bg;
        bg.onload = function () {
            ctx.drawImage(bg, 0, 0, _this.bgWidth, _this.bgHeight);
        }
        bg.src = './img/index_bg.png';

        _this.initListener(ctx);


    },
    initListener: function (ctx) {
        var _this = this;
        var body = $(document.body);
        $(document).on(gameMonitor.eventType.move, function (event) {
            event.preventDefault();
        });
        body.on(gameMonitor.eventType.start, '#rankPlay', function () {
            $('#rankPage').hide();
            $('#gamepanel').show()
            var canvas = document.getElementById('stage');
            var ctx = canvas.getContext('2d');
            _this.ship = new Ship(ctx);
            _this.ship.controll();
            _this.reset();
            _this.run(ctx);
        });

        body.on(gameMonitor.eventType.start, '#frontpage', function () {
            $('#frontpage').css('left', '-100%');
        });

        body.on(gameMonitor.eventType.start, '#indexGoStart', function () {
            $('#guidePanel').hide();
            if (!_this.ship) {
                _this.ship = new Ship(ctx);
                _this.ship.paint();
                _this.ship.controll();
                gameMonitor.run(ctx);
            }
        });
        // WeixinApi.ready(function(Api) {
        //     // 微信分享的数据
        //     //分享给好友的数据
        //     var wxData = {
        //         "appId": "",
        //         "imgUrl" : "../img/icon.png",
        //         "link" : "http://dev.360.cn/html/zhuanti/yutu.html",
        //         "desc" : "进击的玉兔",
        //         "title" : "“玩玉兔 抢月饼”"
        //     };
        //
        //     //朋友圈数据
        //     var wxDataPyq ={
        //     	"appId": "",
        //         "imgUrl" : "../img/icon.png",
        //         "link" : "http://dev.360.cn/html/zhuanti/yutu.html",
        //         "desc" : "“玩玉兔 抢月饼”",
        //         "title" : "进击的玉兔"
        //     }
        //
        //     // 分享的回调
        //     var wxCallbacks = {
        //         // 分享操作开始之前
        //         ready : function() {},
        //         cancel : function(resp) {},
        //         fail : function(resp) {},
        //         confirm : function(resp) {},
        //         all : function(resp) {
        //             //location.href=location.href
        //         }
        //     };
        //
        //     // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        //     Api.shareToFriend(wxData, wxCallbacks);
        //     // 点击分享到朋友圈，会执行下面这个代码
        //     Api.shareToTimeline(wxDataPyq, wxCallbacks);
        //     // 点击分享到腾讯微博，会执行下面这个代码
        //     Api.shareToWeibo(wxData, wxCallbacks);
        // });

    },
    rollBg: function (ctx) {
        if (this.bgDistance >= this.bgHeight) {
            this.bgloop = 0;
        }
        this.bgDistance = ++this.bgloop * this.bgSpeed;
        ctx.drawImage(this.bg, 0, 0, this.bgWidth, this.bgHeight);
        ctx.drawImage(this.bg, 0, 0, this.bgWidth, this.bgHeight);
    },
    run: function (ctx) {
        var _this = gameMonitor;
        ctx.clearRect(0, 0, _this.bgWidth, _this.bgHeight);
        _this.rollBg(ctx);

        //绘制飞船
        _this.ship.paint();
        _this.ship.eat(_this.foodList);


        //产生月饼
        _this.genorateFood();

        //绘制月饼
        for (i = _this.foodList.length - 1; i >= 0; i--) {
            var f = _this.foodList[i];
            if (f) {
                f.paint(ctx);
                f.move(ctx);
            }

        }
        _this.timmer = setTimeout(function () {
            gameMonitor.run(ctx);
        }, Math.round(1000 / 60));

        _this.time++;
    },
    stop: function () {
        var _this = this
        $('#stage').off(gameMonitor.eventType.start + ' ' + gameMonitor.eventType.move);
        setTimeout(function () {
            clearTimeout(_this.timmer);
        }, 0);

    },
    genorateFood: function () {
        var genRate = 50; //产生月饼的频率
        var random = Math.random();
        if (random * genRate > genRate - 1) {
            var left = Math.random() * (this.w - 50);
            var type = (Math.random() * 4) | 0;
            var id = this.foodList.length;
            var f = new Food(type, left, id);
            this.foodList.push(f);
        }
    },
    reset: function () {
        this.foodList = [];
        this.bgloop = 0;
        this.score = 0;
        this.timmer = null;
        this.time = 0;
        $('#score').text(this.score);
    },
    isMobile: function () {
        var sUserAgent = navigator.userAgent.toLowerCase(),
            bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
            bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
            bIsMidp = sUserAgent.match(/midp/i) == "midp",
            bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
            bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
            bIsAndroid = sUserAgent.match(/android/i) == "android",
            bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
            bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile",
            bIsWebview = sUserAgent.match(/webview/i) == "webview";
        return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
    }
}
if (!gameMonitor.isMobile()) {
    gameMonitor.eventType.start = 'mousedown';
    gameMonitor.eventType.move = 'mousemove';
    gameMonitor.eventType.end = 'mouseup';
}
gameMonitor.init();
$('#submitInfo').on('click', function () {
    if ($('#name').val() !== '' && $('#tel').val() !== '') {
        $.post('https://www.topasst.com/web/game/submitInfo', {
            name: $('#name').val(),
            mobile: $('#tel').val(),
            memberType: 2,
            giftId: giftId,
            parentId: parentId,
            score: gameMonitor.score
        }, function (res) {
            if (res.statusCode === 200) {
                getRankList(res.data)
                $('#rankPlay').show()
                $('#rankTitle').show()
                $('#rankPage').show()
                $('#resultPanel').hide()
                $('#rankBack').hide()
            } else {
                alert(res.msg)
            }
        })
    } else {
        alert('请填写相关信息')
    }
})
function getRankList (id) {
    $.post('https://www.topasst.com/web/game/rankList', {
        giftId: giftId,
        memberId: id
    }, function (res) {
        if (res.statusCode === 200) {
            $('#currentmc').text(res.data.rank)
            $('#currentMore').text(res.data.passNumber)
            var list = res.data.list
            if (res.data.rank) {
                list.push({
                    name: res.data.name,
                    rank: res.data.rank,
                    score: res.data.score
                })
            }
            var $li = ''
            list.forEach(function (item, index) {

                $li += '<li class="rank-list-item">\n' +
                    '<span class="w24">NO.'+(item.rank ? item.rank : (index + 1))+'</span>\n' +
                    '<span class="w50">'+item.name+'</span>\n' +
                    '<span class="w26">'+item.score+'pt</span>\n' +
                    '</li>'
            })
            $('#rankList').html($li)

        } else {
            alert(res.msg)
        }
        // $('#fx').show()
    })
}
$('#lookRule').on('click', function () {
    $('#guidePanel').hide()
    $('#rulePage').show()
})
$('#ruleBack').on('click', function () {
    $('#guidePanel').show()
    $('#rulePage').hide()
})
$('#rankBack').on('click', function () {
    $('#guidePanel').show()
    $('#rankPage').hide()
})
$('#lookRank').on('click', function () {
    getRankList('')
    $('#guidePanel').hide()
    $('#rankPlay').hide()
    $('#rankTitle').hide()
    $('#rankPage').show()
    $('#rankBack').show()
})
// $('#rankPlay').on('click', function () {
//     $('#rankPage').hide()
//     $('#gamepanel').show()
// })