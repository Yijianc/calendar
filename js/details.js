/**
 * Created by Boyce on 2016/4/14.
 */
window.onload = function () {

    var $ = function (el) {return document.querySelector(el);},
        SUFFICIENT_MIN = .5,    // 至少一半空房，充足
        INTENSIVE_MIN = .2,     // 20%空房，紧张
        ALMOST_MIN = .01;       // 1%空房，即将满房

    /**
     * 构建房间对象
     */
    function Room(updateTime, stPrice, currPrice, rooms, booked, index) {
        this.updateTime = updateTime;
        this.stPrice = stPrice;
        this.currPrice = currPrice.toFixed(2);
        this.rooms = rooms;
        this.booked = booked;

        this.roomFlag = function () {
            if (this.roomLeftIndex() >= SUFFICIENT_MIN) {
                return '充足';
            } else if (this.roomLeftIndex() >= INTENSIVE_MIN) {
                return '紧张';
            } else if (this.roomLeftIndex() > index) {
                return '即将满房';
            } else {
                return '已满房';
            }
        }
    }

    // 扩展共享属性
    Room.prototype = {
        priceGap: function () {
            var gap = this.currPrice - this.stPrice;
            if (gap > 0) {return '+' + gap.toFixed(2);}
            else if (gap === 0) {return '-';}
            else {return gap.toFixed(2);}
        },
        priceFlag: function () {
            if (this.priceGap() > 0) {return 'increase';}
            else if (this.priceGap() < 0) {return 'decrease';}
            else {return 'balance';}
        },
        roomAvailable: function () {return this.rooms - this.booked;},
        roomLeftIndex: function () {return this.roomAvailable() / this.rooms;}
    };

    /**
     * 构建酒店对象
     */
    function Hotel(booked, price) {
        this.name = '锦江之星-上海外滩经典酒店';
        this.rooms = 100;
        this.roomDetails = {
            '单人房A': new Room('14:00:00', 170.00, price[0], 30, booked[0], .03),
            '单人房B': new Room('16:00:00', 148.00, price[1], 30, booked[1], .03),
            '标准房A': new Room('18:00:00', 245.00, price[2], 30, booked[2], .025)
        };
    }

    // 扩展共享属性
    Hotel.prototype = {
        booked: function () {
            var roomTypes = Object.getOwnPropertyNames(this.roomDetails),
                bookedTotal = 0;
            for (var i = 0, len =roomTypes.length; i < len; i++) {
                bookedTotal += this.roomDetails[roomTypes[i]].booked;
            }
            return bookedTotal;
        },
        roomAvailable: function () {return this.rooms - this.booked();},
        roomLeftIndex: function () {return this.roomAvailable() / this.rooms;},
        roomFlag: function () {
            if (this.roomLeftIndex() >= SUFFICIENT_MIN) {return '充足';}
            else if (this.roomLeftIndex() >= INTENSIVE_MIN) {return '紧张';}
            else if (this.roomLeftIndex() > ALMOST_MIN) {return '即将满房';}
            else {return '已满房';}
        }
    };

    /**
     * 以下两个函数用于随机模拟生成测试数据
     */
    function getDateStr(dat) {
        var y = dat.getFullYear();
        var m = dat.getMonth() + 1;
        m = m < 10 ? '0' + m : m;
        var d = dat.getDate();
        d = d < 10 ? '0' + d : d;
        return y + '-' + m + '-' + d;
    }
    
    function randomBuildData(MIN, MAX) {
        var returnData = {};
        var dat = new Date();
        var datStr = '';
        for (var i = 1; i < 62; i++) {
            datStr = getDateStr(dat);
            returnData[datStr] = Math.ceil(MIN + Math.random() * (MAX - MIN));
            dat.setDate(dat.getDate() + 1);
        }
        return returnData;
    }

    // 房型预订数据及价格信息
    var roomStatus = {
        '单人房A': {booked: randomBuildData(0, 30), price: randomBuildData(120, 220)},
        '单人房B': {booked: randomBuildData(0, 30), price: randomBuildData(98, 198)},
        '标准房A': {booked: randomBuildData(0, 40), price: randomBuildData(195, 295)}
    };
    
    /**
     * 初始化每日房间状态
     */
    function initRoomDaily() {
        var datArr = Object.getOwnPropertyNames(randomBuildData(0,1)),
            singleA = roomStatus['单人房A'],
            singleB = roomStatus['单人房B'],
            standardA = roomStatus['标准房A'],
            returnData = {};

        for (var i = 0, len = datArr.length; i < len; i++) {
            var tmp = datArr[i],
                bookedArr = [singleA.booked[tmp], singleB.booked[tmp], standardA.booked[tmp]],
                priceArr = [singleA.price[tmp], singleB.price[tmp], standardA.price[tmp]];

            returnData[tmp] = new Hotel(bookedArr, priceArr);
        }

//        console.log(returnData);
        return returnData;
    }

    /**
     * 日期比较
     */
    function compareDate(strDate1,strDate2) {
        var date1 = new Date(strDate1.replace(/\-/g, '\/'));
        var date2 = new Date(strDate2.replace(/\-/g, '\/'));
        return date1 - date2;
    }

    /**
    * 重绘表格
    */
    function renderHtml() {
        var /*drawTd = document.querySelectorAll('.ui-calendar-calendar td'),
            */roomInfo = initRoomDaily();
        
        // 抓取需要渲染的日期元素
        this.dateString = function () {
            var drawTd = document.querySelectorAll('.ui-calendar-calendar td');
            var datArr = [];

            for (var i = 0, len = drawTd.length; i < len; i++) {
                var dataValid = drawTd[i].hasAttribute('data-year'),
                    datStr = '',
                    day, month, year;;

                year = drawTd[i].getAttribute('data-year');
                month = parseInt(drawTd[i].getAttribute('data-month')) + 1;
                day = drawTd[i].childNodes[0].textContent;

                if (dataValid) {
                    datStr = year + '-' +
                        (month < 10 ? '0' + month : month) + '-' +
                        (day < 10 ? '0' + day : day);

                    datArr.push(datStr);
                } else {
                    datArr.push('');
                }

                /*datStr = (dataValid ? year : '') + '-' +  // 年
                    (dataValid ? month : '') + '-' +  // 月
                    (dataValid ? day : '');   // 日
                datArr.push(datStr);*/
            }
//            console.log(datArr);
            return datArr;
        };

        // 渲染日历
        this.renderCalendar = function () {
            var drawTd = document.querySelectorAll('.ui-calendar-calendar td');
            var datArr = this.dateString(),
                today = getDateStr(new Date());

            for (var i = 0, len = datArr.length; i < len; i++) {
                var dataValid = drawTd[i].hasAttribute('data-year');

                if (dataValid) {
                    var dailyRoom = roomInfo[datArr[i]],
                        drawEl = drawTd[i].lastElementChild;

                    if (compareDate(datArr[i], today) >= 0) {

                        switch (dailyRoom.roomFlag()) {
                            case '充足': drawEl.style.color = '#fff'; break;
                            case '紧张': drawEl.style.color = 'orange'; break;
                            case '即将满房': drawEl.style.color = 'red'; break;
                            case '已满房': drawEl.style.color = 'purple'; break;
                        }
                    } else {
                        drawEl.style.opacity = .5;
                    }
                }
            }
        };

        // 渲染每日房型信息
        this.renderRoomDaily = function (date) {
            var rateInfo = $('#rate-info'),
                priceInfo = $('#price-info'),
                selected = false;   // 标记为false，表示绘制房型预订率

            this.selectedTab = function (selected) {
                var html = '';

                html += '<table><thead><tr>' +

                    // 如果是房间价格信息多加上一列
                    (selected ? '<td>时间</td>' : '') +
                    '<td>' + (selected ? '房型' : '房型名称') + '</td>' +
                    '<td>当前价格</td>' +
                    '<td>' + (selected ? '涨跌' : '预定库存') + '</td>' +
                    '<td></td></tr></thead><tbody>';

                var roomDetails = roomInfo[date].roomDetails,
                    roomTypes = Object.getOwnPropertyNames(roomDetails);

                var flag = {
                    stock: {
                        '充足': {text: 'stock-sufficient', mark: 'room-left-sufficient'},
                        '紧张': {text: 'stock-intensive', mark: 'room-left-intensive'},
                        '即将满房': {text: 'stock-almost', mark: 'room-left-almost'},
                        '已满房': {text: 'stock-zero', mark: 'room-left-zero'}
                    },
                    price: {
                        'increase': {text: 'price-up', mark: '<span class="icon"><span class="icon-arrowUp"></span></span>'},
                        'balance': {text: 'price-balance', mark: '<span class="icon"><span class="icon-balance"></span></span>'},
                        'decrease': {text: 'price-down', mark: '<span class="icon"><span class="icon-arrowDown"></span></span>'}
                    }
                };

                console.log(roomDetails);
                for (var i = 0, len = roomTypes.length; i < len; i++) {
                    var drawRoom = roomDetails[roomTypes[i]],

                        drawPrice = '<td class="' + flag.price[drawRoom.priceFlag()].text + '">' +
                            '￥' + drawRoom.currPrice +
                            flag.price[drawRoom.priceFlag()].mark+ '</td>',

                        drawTime = '<td>' +
                            '<p class="time">' + drawRoom.updateTime + '</p>' +
                            '<p class="date">' + date.replace(/\-/g, '\/') + '</p>' +
                            '</td>',

                        drawFlag = '<td class="' + flag.stock[drawRoom.roomFlag()].text + '">' +
                            drawRoom.roomFlag() + '</td>',

                        drawPriceGap = '<td class="' + flag.price[drawRoom.priceFlag()].text + '">' +
                            drawRoom.priceGap() + '</td>';

                    html += '<tr>' + (selected ? drawTime : '') +
                        '<td>' + roomTypes[i] + '</td>' + drawPrice +
                        (selected ? drawPriceGap : drawFlag) +
                        '<td class="' + flag.stock[drawRoom.roomFlag()].mark + '"></td>' +
                        '</tr>';
                }

                html += '</tbody></table>';

                return html;
            };

            rateInfo.innerHTML = this.selectedTab(selected);

            selected = true;    // 标记为false，表示绘制房价调整信息
            priceInfo.innerHTML = this.selectedTab(selected);
        };

        // 当点击其他日期时，取得日期并返回
        this.selectedDateChange = function (e) {
            var target = EventUtil.getTarget(e),
                selectedInvalid = false,     // 标记为true时，不重绘数据；反则重绘数据
                parent, isValid, datSelected, preDays, outOfDays,
                m, d,
                today = new Date();

            // 防止被链接带跑
            EventUtil.preventDefault(e);

            parent = target.parentNode;

            // 当点击目标不为日期时，不重绘数据
            isValid = target && target.tagName.toUpperCase() === 'A' && parent.nodeName.toUpperCase() === 'TD';

            m = parseInt(parent.getAttribute('data-month')) + 1;
            d = target.textContent;

            datSelected = parent.getAttribute('data-year') + '-' +
                (m < 10 ? '0' + m : m) + '-' +
                (d < 10 ? '0' + d : d);

            // 当点击日期小于今天，不重绘数据
            preDays = compareDate(datSelected, getDateStr(today)) < 0;

            // 超过当前61天是，不重绘数据
            outOfDays = compareDate(datSelected, getDateStr(new Date(today.setDate(today.getDate() + 61)))) > 0;

            if (!isValid || preDays || outOfDays) {
                selectedInvalid = true;
            } else {
                selectedInvalid = false;

                // 调用房型信息渲染函数
                renderRoomDaily(datSelected);
            }
            renderCalendar();

        }

        this.renderCalendar();
        this.renderRoomDaily(getDateStr(new Date()));

        // 将点击事件委托
        var calendarWrap = $('.calendar');
        EventUtil.delegate(calendarWrap, 'a', 'click', this.selectedDateChange);
    }

    /**
     * 初始化
     */
    function init() {
        renderHtml();
    }

    init();
};
