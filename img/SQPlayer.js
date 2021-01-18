'use strict';

/* ----

# Square Player
# By: Dreamer-Paul
# Last Update: 2019.7.12

一个简洁到极致的单曲播放器。

本代码为奇趣保罗原创，并遵守 MIT 开源协议。欢迎访问我的博客：https://paugram.com

---- */

class SQPlayer{
    constructor(wrapper, key, set){
        this.key = key;
        this.elements = {
            wrap: wrapper,
            player: this.creator("audio"),
            info: this.creator("div", {cls: "info"}),
            title: this.creator("span", {cls: "title"}),
            toggle: this.creator("div", {cls: "toggle"})
        };

        this.elements.player.setAttribute("preload", "none");

        wrapper.dataset[163] ? this.getBy163(wrapper, set.server) : this.setup(wrapper.dataset);
    }

    // 切换按钮
    toggle(){
        this.elements.player.paused ? this.play() : this.pause();
    }

    play(){
        this.elements.player.play();
    }

    pause(){
        this.elements.player.pause();
    }

    creator(tag, attr){
        let a = document.createElement(tag);

        if(attr){
            if(attr.cls) a.className = "sqp-" + attr.cls;
            if(attr.content) a.innerHTML = attr.content;
        }

        return a;
    }

    // 设置播放器
    setup(item){
        const fontSize = window.getComputedStyle(document.querySelector("html")).fontSize.replace("px", "");

        item.link ? this.elements.player.src = item.link : console.error("No files to play!");

        if(item.cover){
            this.elements.wrap.style.backgroundImage = "url(" + item.cover + ")";
        }

        // 播放器主体初始化
        this.elements.title.innerText = item.artist && item.title ? item.title + " - " + item.artist : "未知标题";

        this.elements.info.appendChild(this.elements.title);
        this.elements.wrap.appendChild(this.elements.info);
        this.elements.wrap.appendChild(this.elements.toggle);

        let offset = this.elements.title.offsetWidth - (fontSize * 8);
        let time = parseInt(this.elements.title.offsetWidth / 30);

        const ani = this.creator("style", {content: `
@keyframes sqp-title-${this.key} {
    0%{
        transform: translateX(0);
    }
    50%{
        transform: translateX(${-offset}px);
    }
    100%{
       transform: translateX(0);
    }
}
        `});

        if(offset > 0){
            this.elements.title.style.animation = "sqp-title-" + this.key + " " + time + "s infinite linear";
            this.elements.wrap.appendChild(ani);
        }

        this.elements.toggle.addEventListener("click", () => {
            this.toggle();
        });

        this.elements.player.addEventListener("playing", () => {
            this.elements.toggle.classList.add("pause");
        });
        this.elements.player.addEventListener("pause", () => {
            this.elements.toggle.classList.remove("pause");
        });
    }

    getBy163(value, server){
        const that = this;
        let id = value.getAttribute("data-163");

        const s = {
            "meto": function () {
                const type = isNaN(value) ? `type=song&id=${id}` : `type=search&id=${id}`;

                fetch(`https://api.i-meto.com/api/v1/meting?server=netease&${type}`).then((res) => {
                    return res.json();
                }).then((i) => {
                    i = i[0];

                    that.setup({
                        title:  i.name,
                        artist: i.artist,
                        cover:  i.cover,
                        link:   i.url,
                    });
                })
            },
            "paul": function () {
                const type = isNaN(value) ? "?title=" : "?id=";

                fetch("https://api.paugram.com/netease/" + type + id).then(function (res) {
                    return res.json();
                }).then((item) => {
                    that.setup(item);
                });
            }
        }

        s[server]();
    }
}

console.log("%c Square Player %c https://paugram.com ","color: #fff; margin: 1em 0; padding: 5px 0; background: #1875b3;","margin: 1em 0; padding: 5px 0; background: #efefef;");

class SQP_Extend {
    constructor(settings){
        this.init(settings);
    }

    init(settings){
        this.players = [];
        this.wrapper = document.querySelectorAll("sqplayer");

        this.wrapper.forEach(function (item, key) {
            this.players.push(new SQPlayer(item, key, settings));
        }, this)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let SQP_EX = new SQP_Extend({server: "paul"});
});