/**
 * Created by Boyce on 2016/4/16.
 */

/**
 * 渲染每日房型信息
 */
function renderRoomDaily(date) {
    var rateInfo = $('#rate-info'),
        priceInfo = /*$('#price-info')*/ false;

    var htmlRate = '';

    htmlRate += '<table><thead><tr>' +

        // 如果是房间价格信息多加上一列
        (priceInfo ? '<td>时间</td>' : '') +
        '<td>' + (priceInfo ? '房型' : '房型名称') + '</td>' +
        '<td>当前价格</td>' +
        '<td>' + (priceInfo ? '涨跌' : '预订库存') + '</td>' +
        '<td></td></tr></thead><tbody>';

    var roomDetails = initRoomDaily()[date].roomDetails,
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

        htmlRate += '<tr>' + (priceInfo ? drawTime : '') +
            '<td>' + roomTypes[i] + '</td>' + drawPrice +
            (priceInfo ? drawPriceGap : drawFlag) +
            '<td class="' + flag.stock[drawRoom.roomFlag()].mark + '"></td>' +
            '</tr>';
    }

    htmlRate += '</tbody></table>';
    rateInfo.innerHTML = htmlRate;
    priceInfo.innerHTML = htmlRate;
}


/**
 * 渲染日历
 */
function renderCalendar() {
    var calendar = document.querySelectorAll('.ui-calendar-calendar td'),
        dailyData = initRoomDaily();

    /*var testData = dailyData['2016-4-16'];
     console.log('booked: ' + testData.booked());
     console.log('available: ' + testData.roomAvailable());
     console.log('flag: ' + testData.roomFlag());
     console.log('index: ' + testData.roomLeftIndex());
     console.log('currPrice: ' + testData.roomDetails['singleA'].currPrice);
     console.log('priceGap: ' + testData.roomDetails['singleA'].priceGap());
     console.log('A available: ' + testData.roomDetails['singleA'].roomAvailable());
     console.log('A flag: ' + testData.roomDetails['singleA'].roomFlag());*/

    for (var i = 0, len = calendar.length; i < len; i++) {
        var dataYear = calendar[i].attributes.getNamedItem('data-year'),
            dataMonth = calendar[i].attributes.getNamedItem('data-month');

        if (dataYear && dataMonth) {
            var today = getDateStr(new Date()),
                datStr = '',
                day, month, year;

            year = calendar[i].getAttribute("data-year");
            month = calendar[i].getAttribute("data-month");
            day = calendar[i].childNodes[0].textContent;
            datStr = year + '-' + (parseInt(month) + 1) + '-' + day;

            if (compareDate(datStr, today) >= 0) {
                var dailyRoom = dailyData[datStr],
                    drawEl = calendar[i].lastElementChild;

                switch (dailyRoom.roomFlag()) {
                    case '充足': drawEl.style.color = '#fff'; break;
                    case '紧张': drawEl.style.color = 'orange'; break;
                    case '即将满房': drawEl.style.color = 'red'; break;
                    case '已满房': drawEl.style.color = 'purple'; break;
                }
            }
        }

    }
}


/**
 * 构建房间对象
 */
function ROOM(updateTime, stPrice, currPrice, rooms, booked, index) {
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
ROOM.prototype = {
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
function HOTEL(booked, price) {
    this.name = '锦江之星-上海外滩经典酒店';
    this.rooms = 100;
    this.roomDetails = {
        '单人房A': new ROOM('14:00:00', 170.00, price[0], 30, booked[0], .03),
        '单人房B': new ROOM('16:00:00', 148.00, price[1], 30, booked[1], .03),
        '标准房A': new ROOM('18:00:00', 245.00, price[2], 30, booked[2], .025)
    };
}

// 扩展共享属性
HOTEL.prototype = {
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

    htmlRate += '<tr>' + (priceInfo ? drawTime : '') +
        '<td>' + roomTypes[i] + '</td>' + drawPrice +
        (priceInfo ? drawPriceGap : drawFlag) +
        '<td class="' + flag.stock[drawRoom.roomFlag()].mark + '"></td>' +
        '</tr>';
}

htmlRate += '</tbody></table>';
rateInfo.innerHTML = htmlRate;
priceInfo.innerHTML = htmlRate;
}
