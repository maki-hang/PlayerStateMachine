//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.speed = 0.5;
        this.timeOnEnterFrame = 0;
        this.clickx = 0;
        this.clicky = 0;
        this.playerMod = 10;
        this.playerStay = new Array();
        this.playerRun = new Array();
        this.moveScaleX = 0;
        this.moveScaleY = 0;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var player = this.createBitmapByName("s1_png");
        this.addChild(player);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        player.x = stageW / 2;
        player.y = stageH / 2;
        player.anchorOffsetX = player.width / 2;
        player.anchorOffsetY = player.height - 5;
        this.player = player;
        this.LoadPlayer1();
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.OnMouseClick, this);
        this.Anime(player, this.playerMod, this.playerStay);
    };
    p.Anime = function (b, playerMod, playerAnime) {
        var frame = 0;
        var animeFrame = 0;
        egret.Ticker.getInstance().register(function () {
            b.texture = playerAnime[frame];
            frame++;
            if (frame >= playerMod) {
                frame = 0;
            }
        }, this);
    };
    p.LoadPlayer1 = function () {
        for (var i = 1; i < 5; i++) {
            if (i < 4)
                this.playerStay[i] = RES.getRes("s" + i + "_png");
            else
                this.playerStay[i] = RES.getRes("s" + 1 + "_png");
        }
        for (var i = 1; i < 5; i++) {
            if (i < 4)
                this.playerRun[i] = RES.getRes("r" + i + "_png");
            else
                this.playerRun[i] = RES.getRes("r" + 1 + "_png");
        }
    };
    p.OnMouseClick = function (e) {
        this.playerMod = 15;
        this.Anime(this.player, this.playerMod, this.playerRun);
        this.clickx = e.stageX;
        this.clicky = e.stageY;
        var lengthx = (this.clickx - this.player.x);
        var lengthy = (this.clicky - this.player.y);
        var lengthMax = 0;
        lengthMax = Math.pow(lengthx * lengthx + lengthy * lengthy, 1 / 2);
        this.moveScaleX = lengthx / lengthMax;
        this.moveScaleY = lengthy / lengthMax;
        this.addEventListener(egret.Event.ENTER_FRAME, this.onMove, this);
        this.timeOnEnterFrame = egret.getTimer();
    };
    p.onMove = function (e) {
        var now = egret.getTimer();
        var time = this.timeOnEnterFrame;
        var pass = now - time;
        this.player.x += this.speed * pass * this.moveScaleX;
        this.player.y += this.speed * pass * this.moveScaleY;
        this.timeOnEnterFrame = egret.getTimer();
        if (this.player.x - this.clickx < 2 && this.player.x - this.clickx > -2) {
            this.playerMod = 10;
            this.Anime(this.player, this.playerMod, this.playerStay);
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onMove, this);
        }
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map