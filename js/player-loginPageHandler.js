"undefined" == typeof GameHallHandler && (GameHallHandler = {});

(function() {
    let templateElement;

    function updateTabImages(gameType) {
        if (!GameHallUtils.isOLD() && ["BUENASB"].includes(PageConfig.brandName)) {
            $j("#gameMenuTabWrapper img.tab").each(function(index, element) {
                const $element = $j(element);
                const selectIndex = element.src.lastIndexOf("-select.webp");
                
                if (selectIndex > 0) {
                    const baseSrc = element.src.slice(0, selectIndex);
                    $element.attr("src", baseSrc + ".webp");
                }
                
                if ($element.hasClass(gameType.toUpperCase())) {
                    const baseSrc = element.src.slice(0, element.src.lastIndexOf(".webp"));
                    $element.attr("src", baseSrc + "-select.webp");
                }
            });
        }
    }

    function createGameElement(gameData, container, gameType, displayType) {
        let gameElement;
        const platform = gameData.platform;
        const targetContainer = container;
        const isJackpot = "JACKPOT" === displayType;
        const isExclusive = "EXCLUSIVE" == displayType;
        
        if (PageConfig.showEntryGameType.includes(gameType.toUpperCase())) {
            gameElement = templateElement.querySelector("#entryGameTemplate").cloneNode(true);
            gameElement.setAttribute("id", platform + "_" + gameData.gameKey);
            gameElement.setAttribute("platform", platform);
            gameElement.setAttribute("game_code", gameData.gameCode);
            gameElement.setAttribute("gameType", gameType);
            gameElement.querySelector("#liImg").setAttribute("data-src", GameHallUtils.getImgUrl(gameData, "LOCAL" === displayType));
            
            GameHallUtils.displayByBonusLimit(gameElement);
            GameHallUtils.setLazyLoad(gameElement);
            targetContainer.appendChild(gameElement);
        } else {
            gameElement = templateElement.querySelector("#gameTemplate").cloneNode(true);
            const platformNameElement = gameElement.safeSelector("#platformName");
            
            if (isJackpot) {
                platformNameElement.parentNode.removeChild(platformNameElement);
            } else if (PageConfig.specialPlatformDisplayName.has(gameData.platform)) {
                if ("ORIGINAL" == displayType) {
                    platformNameElement.parentNode.removeChild(platformNameElement);
                } else {
                    platformNameElement.textContent = PageConfig.specialPlatformDisplayName.get(gameData.platform);
                }
            } else {
                platformNameElement.textContent = gameData.platform;
            }
            
            gameElement.setAttribute("id", platform + "_" + gameData.gameKey);
            gameElement.setAttribute("platform", platform);
            gameElement.setAttribute("game_code", gameData.gameCode);
            gameElement.setAttribute("gameType", gameData.gameType);
            
            const cacheKey = GameHallUtils.buildCacheKey(gameData);
            const gameTagArea = $j(gameElement).find("#gameTagArea");
            
            // Add hot icon for top games
            if ("TOP" != displayType && PageConfig.topGames.includes(cacheKey)) {
                const hotIcon = templateElement.querySelector("#hotIcon").cloneNode(true);
                gameTagArea && gameTagArea.append(hotIcon);
            }
            
            // Add new game icon
            if (gameData.isNewGame && "NEW" != displayType) {
                const newIcon = templateElement.querySelector("#newIcon").cloneNode(true);
                gameTagArea && gameTagArea.append(newIcon);
            }
            
            // Add bonus event tags
            if (PageConfig.hasBonusEvent) {
                const gameTagMap = BonusEventHandler.gameTagIdMap[cacheKey] || {};
                for (let tagId in gameTagMap) {
                    const tagElement = templateElement.querySelector("#" + tagId).cloneNode(true);
                    if (tagId === BonusEventPresentHandler.REBATE.gameTagId) {
                        gameElement.classList.add("show-rebate");
                        tagElement.safeSelector("#tagRebateRatio").innerHTML = document.getElementById("rebateRatio").innerHTML;
                    }
                    gameTagArea && gameTagArea.append(tagElement);
                }
            }
            
            // Set game image
            if (isExclusive) {
                gameElement.querySelector("#liImg").setAttribute("data-src", GameHallUtils.getBrandExclusiveImgUrl(gameData, PageConfig.brandName));
            } else {
                gameElement.querySelector("#liImg").setAttribute("data-src", GameHallUtils.getImgUrl(gameData, "LOCAL" === displayType));
            }
            
            gameElement.querySelector("#gameNameP").append(GameHallUtils.getGameDisplayName(gameData));
            
            // Add jackpot tag
            if (!isJackpot && PageConfig.isShowJackpot && gameData.showJackpot) {
                const jackpotTag = templateElement.querySelector("#jackpotGameTag").cloneNode(true);
                const tagArea = $j(gameElement).find("#gameTagArea");
                tagArea && tagArea.prepend(jackpotTag);
            }
            
            // Build must hit by
            if ("FREESPIN" != displayType) {
                MustHitByHandler.buildSingleMustHitBy(gameElement);
            }
            
            // Handle currency ratio for specific platforms
            if (["BGCASINO"].includes(platform) && "MMK" == PageConfig.playerCurrency) {
                gameElement.querySelector(".ratio").append("$1000 : 1p");
                gameElement.querySelector(".ratio").removeAttribute("style");
            }
            
            GameHallUtils.displayByBonusLimit(gameElement);
            GameHallUtils.setLazyLoad(gameElement);
            GameEleCache.put(gameData, gameElement);
            
            if (targetContainer) {
                targetContainer.appendChild(gameElement);
            }
        }
        
        return gameElement;
    }

    function buildLiveTableGames(games) {
        if (games.length > 0) {
            const livetableGame = document.getElementById("livetableGame");
            livetableGame.classList.add("num-" + games.length);
            
            if (games.length > 4) {
                livetableGame.classList.add("add-arrow");
            }
            
            buildHotTableElements(games, document.getElementById("hotTableDiv"));
            livetableGame.style.display = "block";
            
            new Swiper("#hotTable_swiper", {
                slidesPerView: 2,
                slidesPerGroup: 2,
                grid: {
                    rows: GameHallUtils.getRowsPerView("#hotTable_swiper", 2),
                    fill: "row"
                },
                spaceBetween: 5,
                loop: false,
                navigation: {
                    nextEl: "#hotTable_swiper_button_next",
                    prevEl: "#hotTable_swiper_button_prev"
                },
                lazy: {
                    loadOnTransitionStart: true,
                    loadPrevNext: true,
                    checkInView: true
                },
                watchSlidesProgress: true,
                breakpoints: {
                    720: {
                        slidesPerView: 5,
                        slidesPerGroup: 5,
                        grid: {
                            rows: GameHallUtils.getRowsPerView("#hotTable_swiper", 5),
                            fill: "row"
                        }
                    },
                    1024: {
                        slidesPerView: 6,
                        slidesPerGroup: 6,
                        grid: {
                            rows: GameHallUtils.getRowsPerView("#hotTable_swiper", 6),
                            fill: "row"
                        }
                    }
                },
                on: {
                    init: function(swiper) {
                        swiper.navigation.prevEl.style.display = "none";
                        setTimeout(() => GameHallUtils.toggleSwiperButton(swiper), 100);
                    },
                    slideChange: function(swiper) {
                        swiper.lazy.load();
                    },
                    slideChangeTransitionEnd: function(swiper) {
                        GameHallUtils.toggleSwiperButton(swiper);
                    }
                }
            });
        }
    }

    function buildHotTableElements(games, container) {
        games.forEach(function(game) {
            const tableElement = document.getElementById("hotTableGameTemplate").cloneNode(true);
            
            if ("FIRSTPERSON" == game.casinoTableType) {
                tableElement.querySelector("#tableImg").setAttribute("data-src", game.imgUrl.replace(".webp", "-w.webp"));
            } else {
                tableElement.querySelector("#tableImg").setAttribute("data-src", game.imgUrl);
            }
            
            tableElement.querySelector("#tableNameP").textContent = GameHallUtils.getGameDisplayName(game);
            tableElement.setAttribute("platform", game.platform);
            tableElement.setAttribute("tableCode", game.tableCode);
            tableElement.setAttribute("id", game.platform + "_" + game.gameKey);
            tableElement.classList.add("li-" + game.platform);
            tableElement.classList.add(game.casinoTableType);
            
            GameHallUtils.setGameInfoToBtn(tableElement, game);
            
            if (["BGCASINO"].includes(game.platform) && "MMK" == PageConfig.playerCurrency) {
                const currencyRatio = tableElement.querySelector("#currencyRatio");
                currencyRatio.style.display = "block";
                currencyRatio.textContent = "1000 : 1";
            } else {
                tableElement.querySelector("#currencyRatio").remove();
            }
            
            GameHallUtils.displayByBonusLimit(tableElement);
            container.appendChild(tableElement);
        });
    }

    function processTopAreaGames(gameData) {
        for (let [gameType, games] of Object.entries(gameData)) {
            gameType = gameType.toLowerCase();
            const gameArea = document.getElementById(gameType + "Game");
            
            if (null != gameArea) {
                games.forEach(function(game, index) {
                    GameHallUtils.pushCacheGames(PageConfig.topGames, game);
                    const gameElement = createGameElement(game, document.getElementById(gameType + "GameUl"), gameType, "TOP");
                    if ("live" === gameType && 0 == index) {
                        $j(gameElement).addClass("promote");
                    }
                });
                
                if (PageConfig.defaultPlatformType[gameType]) {
                    const moreGameElement = templateElement.querySelector("#moreGameDD").cloneNode(true);
                    moreGameElement.querySelector("#moreGame").setAttribute("onclick", "GameHallHandler.openGamePage('" + PageConfig.defaultPlatformType[gameType].default + "','" + gameType + "')");
                    document.getElementById(gameType + "DL").append(moreGameElement);
                }
                
                if (games.length > 0) {
                    gameArea.removeAttribute("style");
                }
            }
        }
    }

    function processNewGames(games) {
        $j.each(games, function(index, game) {
            createGameElement(game, document.getElementById("newGameUl"), "new", "NEW");
        });
        
        const navBox = document.getElementById("NEWNavBox");
        if (navBox) {
            $j("#NEWli").show();
            navBox.setAttribute("onclick", "GameHallUtils.scrollToAnchor('newGame'," + headerHeight + ")");
        }
        
        JCache.get("#newGame").removeAttr("style");
    }

    function processGamesByType(games, gameType, displayType) {
        const gameArea = document.getElementById(gameType + "Game");
        if (null == gameArea) {
            return;
        }
        
        if (games && games.length) {
            const gameList = document.getElementById(gameType + "GameUl");
            games.forEach(game => {
                createGameElement(game, gameList, "", displayType);
            });
            gameArea.removeAttribute("style");
        } else {
            gameArea.remove();
        }
    }

    GameHallHandler.init = function() {
        templateElement = document.getElementById("HTMLTemplate");
        AudioPlayer.init();
        
        // Initialize existing game list items
        document.querySelectorAll(".ul-gameList>li").forEach(function(element) {
            const gameData = {
                platform: element.getAttribute("platform"),
                gameCode: element.getAttribute("game_code")
            };
            GameHallUtils.setLazyLoad(element);
            GameEleCache.put(gameData, element);
        });
        
        // Initialize Must Hit By handler
        MustHitByHandler.initSetting({
            url: PageConfig.getMustHitByInfoUrl,
            currency: PageConfig.playerCurrency,
            platform: PageConfig.mustHitByPlatform,
            htmlUrl: PageConfig.MHBHtml,
            gameHallId: "gameHallBody"
        }).then(() => MustHitByHandler.start());
        
        // Load live table games if enabled
        if (PageConfig.hasLiveTableArea) {
            $j.ajax({
                async: false,
                type: "POST",
                url: PageConfig.getLiveHotTableGames,
                success: function(response) {
                    if (null == response || $j.isEmptyObject(response) || response.error) {
                        PageConfig.homeHiddenType.push("livetable");
                        if (response.error) {
                            alert(response.error);
                        }
                        return;
                    }
                    buildLiveTableGames(response);
                }
            });
        }
        
        // Load top area games
        if (PageConfig.hasTopArea) {
            $j.ajax({
                async: false,
                type: "POST",
                url: PageConfig.getHomeGames,
                data: { gameTypes: PageConfig.homeAreaTopGameTypes },
                success: function(response) {
                    if (null == response || $j.isEmptyObject(response) || response.error) {
                        if (response.error) {
                            alert(response.error);
                        }
                    } else {
                        processTopAreaGames(response);
                    }
                }
            });
        }
        
        // Load new games
        if (PageConfig.hasNewArea) {
            $j.ajax({
                async: false,
                type: "POST",
                data: {
                    upperLimit: PageConfig.newGameUpperLimit,
                    days: PageConfig.newGameDays
                },
                url: PageConfig.getNewestGames,
                success: function(response) {
                    if (null == response || $j.isEmptyObject(response) || response.error) {
                        PageConfig.homeHiddenType.push("new");
                        if (response.error) {
                            alert(response.error);
                        }
                        return;
                    }
                    processNewGames(response);
                }
            });
        }
        
        // Load local games
        if (PageConfig.hasLocalGame) {
            $j.ajax({
                async: false,
                type: "POST",
                url: PageConfig.getLocalGames,
                success: function(response) {
                    if (response && response.error) {
                        alert(response.error);
                    }
                    processGamesByType(response, "local", "LOCAL");
                }
            });
        }
        
        // Load exclusive games
        if (PageConfig.hasExclusiveGame) {
            $j.ajax({
                async: false,
                type: "POST",
                url: PageConfig.getExclusiveGames,
                success: function(response) {
                    if (response && response.error) {
                        alert(response.error);
                    }
                    processGamesByType(response, "exclusive", "EXCLUSIVE");
                }
            });
        }
        
        // Load original games
        if (PageConfig.hasOriginalGame) {
            $j.ajax({
                async: false,
                type: "POST",
                url: PageConfig.getOriginalGames,
                success: function(response) {
                    if (response && response.error) {
                        alert(response.error);
                    }
                    processGamesByType(response, "original", "ORIGINAL");
                }
            });
        }
        
        // Initialize additional handlers
        if (PageConfig.isShowRankRecord) {
            RankRecordEntranceHandler.init();
        }
        
        if (PageConfig.isShowRaceWin) {
            RaceWinEntranceHandler.init();
        }
        
        GameHallUtils.slidingEffect("#gameMenuTabGroup", "#gameMenuTabWrapper", "li");
    };

    GameHallHandler.buildQrcode = function(count) {
        for (let i = 0; i < count; i++) {
            const qrcodeId = "#qrcode" + i;
            const contactMenuId = "#contact-menu" + i;
            
            $j(qrcodeId).qrcode({
                text: $j(qrcodeId).attr("value"),
                render: "image",
                size: "100",
                quiet: 2,
                id: "qrcode-image" + i
            });
            
            $j(contactMenuId).attr("title", $j(contactMenuId).attr("title") + $j(qrcodeId).find("#qrcode-image" + i).prop("outerHTML"));
        }
    };

    GameHallHandler.switchGamePage = function(gameType) {
        if (!document.getElementById(gameType + "Tab").classList.contains("select")) {
            JCache.get("#gamePageDiv>section").hide();
            
            if (0 == JCache.get("#" + gameType + "Game").length) {
                loadEntryGameType(gameType, PageConfig.showEntryGameType.includes(gameType.toUpperCase()));
            }
            
            if ("home" == gameType) {
                showHomePageElements();
            } else {
                showGameTypePageElements(gameType);
            }
            
            updateTabImages(gameType);
            JCache.get("#gameHallSection").show();
            JCache.get("#gameMenuTabWrapper li").removeClass("select");
            JCache.get("#" + gameType + "Tab").addClass("select");
        }
    };

    function loadEntryGameType(gameType, shouldLoad) {
        if (shouldLoad) {
            $j.ajax({
                async: true,
                type: "POST",
                data: { gameType: gameType.toUpperCase() },
                url: PageConfig.queryEntryGames,
                success: function(response) {
                    if (null == response || $j.isEmptyObject(response) || response.error) {
                        if (response.error) {
                            alert(response.error);
                        }
                    } else {
                        buildEntryGameTemplate(response, gameType);
                    }
                },
                beforeSend: function() {
                    JCache.get(".loading-box").show();
                },
                complete: function() {
                    JCache.get(".loading-box").hide();
                }
            });
        }
    }

    function buildEntryGameTemplate(games, gameType) {
        const gameTemplate = templateElement.querySelector("#homeGameTemplate").cloneNode(true);
        gameTemplate.setAttribute("id", gameType + "Game");
        gameTemplate.setAttribute("class", gameType + "-game");
        gameTemplate.querySelector("#homeGameDL").setAttribute("id", gameType + "Icon");
        gameTemplate.querySelector("#homeGameDT").setAttribute("class", "icon-" + gameType);
        
        if (!GameHallUtils.isOLD()) {
            const img = document.createElement("img");
            const imagePath = GameHallUtils.isNEW() ? "POPULAR" : "CLASSIC";
            img.src = PageConfig.imagePrefix + "/theme/images/src-common/GAMETYPE-img/" + imagePath + "-TOPMENU/" + gameType.toUpperCase() + ".webp";
            gameTemplate.querySelector("#homeGameDT").appendChild(img);
        }
        
        gameTemplate.querySelector("#homeGameDT").append(I18N.get("gamehall.tab." + gameType + "games"));
        gameTemplate.querySelector("#homeGameUL").setAttribute("id", gameType + "GameUl");
        document.getElementById("gameHallSection").append(gameTemplate);
        
        for (let [key, game] of Object.entries(games)) {
            createGameElement(game, document.getElementById(gameType + "GameUl"), gameType, "");
        }
        
        PageConfig.homeHiddenType.push(gameType);
    }

    function showHomePageElements() {
        JCache.get("#gameHallSection>div").show();
        JCache.get('#gameHallSection dl[id$="DL"] dt').show();
        PopupUtil.closeModal("#gameHallSection>#challengeChoiceDiv");
        $j("#gameHallSection>#challengeEventTemplate").hide();
        
        if ("" == $j("#challengingTicketModal").data("turnoverMap")) {
            $j("#gameHallSection>#gameHallChallengeDesc").addClass("d-none");
        }
        
        if (PageConfig.isShowRankRecord || PageConfig.hasFeatureArea) {
            JCache.get("#rankRecordSection").show();
            RankRecordEntranceHandler.resetClock();
        } else {
            JCache.get("#rankRecordSection").hide();
        }
        
        if (PageConfig.isShowRaceWin) {
            JCache.get("#raceWinArea").show();
        } else {
            JCache.get("#raceWinArea").hide();
        }
        
        const bonusEventBanner = document.getElementById("bonusEventBannerWrapper");
        const bonusEventHome = document.getElementById("bonusEventHomeArea");
        if (bonusEventHome && bonusEventBanner && 0 == bonusEventBanner.children.length) {
            bonusEventHome.style.display = "none";
        }
        
        for (let i = 0; i < PageConfig.homeHiddenType.length; i++) {
            JCache.get("#" + PageConfig.homeHiddenType[i] + "Game").hide();
        }
    }

    function showGameTypePageElements(gameType) {
        for (let i = 0; i < PageConfig.homeHiddenType.length; i++) {
            JCache.get("#" + PageConfig.homeHiddenType[i] + "Game").hide();
        }
        
        JCache.get("#gameHallSection>div").hide();
        JCache.get("#rankRecordSection").hide();
        JCache.get("#raceWinArea").hide();
        JCache.get("#" + gameType + "Game").show();
        JCache.get("#" + gameType + "Game dt").hide();
        JCache.get("#pageBodyDiv").hide();
        JCache.get("#raceDiv").hide();
    }

    GameHallHandler.openGamePage = function(platform, gameType) {
        let promoGameTypeMap;
        
        gameType = gameType ? gameType.toLowerCase() : gameType;
        JCache.get("#gamePageDiv>section").hide();
        JCache.get("#gameHallSection").hide();
        JCache.get("#" + gameType + "GameSection").show();
        
        GameHallHandler.switchGamePageGames(platform, gameType);
        JCache.get("#gameMenuTabWrapper li").removeClass("select");
        JCache.get("#" + gameType + "Tab").addClass("select");
        updateTabImages(gameType);
        
        if (0 === PageConfig.showPromoGameTypeByPlatform.size) {
            const storedData = localStorage.getItem("showPromoGameTypeByPlatform");
            const parsedData = storedData ? JSON.parse(storedData) : [];
            promoGameTypeMap = new Map(parsedData.map(([key, value]) => [key, new Set(value)]));
        } else {
            promoGameTypeMap = PageConfig.showPromoGameTypeByPlatform;
        }
        
        if (promoGameTypeMap.has(gameType.toUpperCase())) {
            promoGameTypeMap.get(gameType.toUpperCase()).forEach(platform => {
                $j("#" + gameType + "_logo_" + platform).addClass("show-promo");
            });
        }
    };

    GameHallHandler.switchGamePageGames = function(platform, gameType) {
        if (JCache.get("#" + gameType + "_logo_" + platform).attr("isDone")) {
            JCache.get("#" + gameType + "_section_" + platform).show();
        } else {
            if (GameHallUtils.isOLD() && "live" == gameType) {
                loadCasinoTables(platform);
            } else {
                loadGamePageGames(platform, gameType);
            }
            JCache.get("#" + gameType + "_logo_" + platform).attr("isDone", true);
        }
        
        $j("#" + gameType + "GameDiv>ul").hide();
        $j("#ul_" + gameType + "_" + platform).show();
        JCache.get("#" + gameType + "GameTabUl li").removeClass("select");
        JCache.get("#" + gameType + "_logo_" + platform).addClass("select");
        JCache.get("#" + gameType + "GameTabUl").show();
        
        $j(".bonusEventChallengeGameInfo").hide();
        $j(".gameHallJackpotDiv[platform!=" + platform + "][gameType=" + gameType + "]").hide();
        $j("#gameHallJackpotDiv_" + platform + "_" + gameType).show();
        
        JCache.get("#casinoTypeBox").hide();
        JCache.get("#casinoTypeBox").find(".tab-navs>a").removeClass("active");
        
        const casinoTableTypes = [];
        $j("#ul_live_" + platform).find("li").each(function() {
            if (!casinoTableTypes.includes($j(this).attr("casinoTableType"))) {
                casinoTableTypes.push($j(this).attr("casinoTableType"));
            }
        });
        
        if ("live" === gameType && casinoTableTypes.length > 1) {
            JCache.get("#casinoTypeBox").show();
            JCache.get("#casinoTypeBox").find(".tab-navs>a:first").addClass("active").trigger("click");
            
            PageConfig.casinoTableDisplayInOrder.forEach(function(tableType) {
                if (casinoTableTypes.includes(tableType)) {
                    $j("#casinoTypeUl #casinoType_" + tableType).show();
                } else {
                    $j("#casinoTypeUl #casinoType_" + tableType).hide();
                }
            });
        }
    };

    function loadCasinoTables(platform) {
        $j.ajax({
            async: false,
            type: "POST",
            data: { platform: platform },
            url: PageConfig.queryCasinoTables,
            success: function(response) {
                if (null == response || $j.isEmptyObject(response) || response.error) {
                    if (response.error) {
                        alert(response.error);
                    }
                } else {
                    buildCasinoTableList(response, platform);
                }
            }
        });
    }

    function buildCasinoTableList(tables, platform) {
        const gameType = "live";
        const tableWrapper = JCache.get("#casinoTableWrapperTemplate").clone();
        tableWrapper.attr("id", "ul_" + gameType + "_" + platform);
        
        $j.each(tables, function(index, table) {
            const tableElement = JCache.get("#casinoTableTemplate").clone();
            
            tableElement.find("#tableImg").attr("data-src", "FIRSTPERSON" === table.casinoTableType ? table.imgUrl.replace(".webp", "-w.webp") : table.imgUrl);
            tableElement.find("#tableNameP").text(GameHallUtils.getGameDisplayName(table));
            GameHallUtils.setPlatformImg(tableElement, "#imgPlatformLogo", platform);
            
            tableElement.attr("gameType", "LIVE");
            tableElement.attr("platform", table.platform);
            tableElement.attr("tableCode", table.tableCode);
            tableElement.attr("id", table.platform + "_" + table.gameKey);
            tableElement.attr("game_code", table.gameCode);
            tableElement.attr("game_key", table.gameKey);
            tableElement.attr("casinoTableType", table.casinoTableType);
            tableElement.addClass("li-" + table.platform);
            tableElement.addClass(table.casinoTableType);
            
            if ("MAIN" === table.casinoTableType) {
                tableElement.find("#imgPlatformLogo").remove();
                tableElement.find("#tableNameP").remove();
                tableElement.find("#tableImg").after('<div class="btn-enter">' + I18N.get("player.live.enterlobby") + "</div>");
            }
            
            GameHallUtils.displayByBonusLimit(tableElement[0]);
            GameHallUtils.setLazyLoad(tableElement[0]);
            tableWrapper.append(tableElement);
        });
        
        JCache.get("#liveGameDiv").addClass("section-ul-LIVE");
        JCache.get("#" + gameType + "GameDiv").append(tableWrapper);
    }

    function loadGamePageGames(platform, gameType) {
        $j.ajax({
            type: "POST",
            async: false,
            data: {
                platform: platform,
                gameType: gameType
            },
            url: PageConfig.queryGamePageGames,
            success: function(response) {
                if (null == response || $j.isEmptyObject(response) || response.error) {
                    if (response.error) {
                        alert(response.error);
                    }
                } else {
                    buildGamePageList(response, platform, gameType);
                }
            }
        });
    }

    function buildGamePageList(games, platform, gameType) {
        const gameList = JCache.get("#ulGameIconTemplate").clone();
        gameList.attr("id", "ul_" + gameType + "_" + platform);
        gameList.attr("platform", platform);
        gameList.attr("gameType", gameType);
        
        const gameDiv = JCache.get("#" + gameType + "GameDiv");
        let challengeGameInfo;
        
        if (PageConfig.hasBonusEvent && 0 == gameDiv.find("#bonusEventChallengeGameInfo").length) {
            challengeGameInfo = JCache.get("#divChallengeGameListTemplate").clone();
            challengeGameInfo.attr("id", "bonusEventChallengeGameInfo");
            challengeGameInfo.attr("platform", platform);
            challengeGameInfo.attr("gameType", gameType);
            challengeGameInfo.hide();
            
            const lastJackpotDiv = gameDiv.find(".gameHallJackpotDiv:last-child");
            if (lastJackpotDiv.length > 0) {
                challengeGameInfo.insertAfter(lastJackpotDiv);
            } else {
                gameDiv.append(challengeGameInfo);
            }
        }
        
        if (PageConfig.isShowJackpot) {
            for (let i = 0; i < PageConfig.jackpotDatas.length; i++) {
                if (platform == PageConfig.jackpotDatas[i].platform && gameType == PageConfig.jackpotDatas[i].gameType.toLowerCase()) {
                    const jackpotDiv = $j("#gameHallJackpotDiv").clone();
                    jackpotDiv.attr("style", "");
                    jackpotDiv.attr("class", "gameHallJackpotDiv jackpot-box-logo");
                    jackpotDiv.attr("id", "gameHallJackpotDiv_" + platform + "_" + gameType);
                    jackpotDiv.attr("platform", platform);
                    jackpotDiv.attr("gameType", gameType);
                    jackpotDiv.find("#jackpotLogo").attr("class", "platform-logo logo-" + platform);
                    jackpotDiv.find("#jackpotImg").attr("src", PageConfig.imagePrefix + "/theme/images/src-common/PLATFORM-img/100x100/" + platform + "-logo.webp");
                    jackpotDiv.find("#jackpotWinner").attr("onclick", "JackpotHandler.getJackpotsWinner('" + platform + "','" + gameType + "');");
                    jackpotDiv.find("#Grand").attr("id", "Grand_" + platform + "_" + gameType).text(PageConfig.jackpotDatas[i].grand);
                    jackpotDiv.find("#Major").attr("id", "Major_" + platform + "_" + gameType).text(PageConfig.jackpotDatas[i].major);
                    jackpotDiv.find("#MajorSpan").html("MAJOR");
                    jackpotDiv.find(".big-jackpot").attr("jp-platform", platform);
                    
                    const challengeInfo = gameDiv.find("#bonusEventChallengeGameInfo");
                    if (challengeInfo.length > 0) {
                        jackpotDiv.insertBefore(challengeInfo);
                    } else {
                        gameDiv.append(jackpotDiv);
                    }
                    
                    jackpotDiv.find("#jackpotTagValue").html(PageConfig.jackpotDatas[i].jpBonusRatio);
                    if (0 != jackpotDiv.find("#jackpotTagValue").html()) {
                        jackpotDiv.find("#jackpotTag").show();
                    }
                }
            }
        }
        
        games.forEach(function(game) {
            createGameElement(game, gameList[0], gameType, "");
        });
        
        gameDiv.append(gameList);
        $j("#ul_" + gameType + "_" + platform).show();
    }

    GameHallHandler.switchCasinoTableType = function(element, tableType) {
        $j("#casinoTypeUl").find(".tab-navs>a").removeClass("active");
        $j(element).addClass("active");
        
        const tableListId = "ul_live_" + $j("#liveGameTabUl li.select a").attr("data-value");
        document.getElementById(tableListId).querySelectorAll("li").forEach(function(listItem) {
            if ("ALL" === tableType) {
                $j(listItem).show();
            } else {
                $j(listItem).hide();
                if (listItem.classList.contains("MAIN") || listItem.classList.contains(tableType)) {
                    $j(listItem).show();
                }
            }
        });
    };

    GameHallHandler.getGameDisplayName = function(game) {
        if ("cn" == PageConfig.lang && game.gameNameCn) {
            return game.gameNameCn;
        }
        if ("vn" == PageConfig.lang && game.gameNameVn) {
            return game.gameNameVn;
        }
        if ("th" === PageConfig.lang && game.gameNameTh) {
            return game.gameNameTh;
        }
        return game.gameNameEn;
    };

    GameHallHandler.openFunctionPage = function(url) {
        window.open(url, "", config = "height=720,width=1080");
    };

    GameHallHandler.queryJackpotGames = function(callback, platform) {
        if (PageConfig.isShowJackpot) {
            $j.ajax({
                url: PageConfig.getJackpotGames,
                data: {
                    webSiteType: PageConfig.webSiteType,
                    shId: PageConfig.shId,
                    platform: platform,
                    maxGameCount: 10
                },
                async: false,
                type: "POST",
                success: function(response) {
                    if (null == response || $j.isEmptyObject(response) || response.error) {
                        PageConfig.homeHiddenType.push("jackpot");
                        if (response.error) {
                            alert(response.error);
                        }
                        return;
                    }
                    buildJackpotGames(response);
                }
            });
        } else {
            PageConfig.homeHiddenType.push("jackpot");
        }
    };

    function buildJackpotGames(jackpotData) {
        const jackpotGame = document.getElementById("jackpotGame");
        if (null == jackpotGame) return;
        
        let jackpotTable = templateElement.querySelector("#jackpotDivTb").cloneNode(true);
        let hasContent = true;
        const maxGamesPerColumn = 5;
        const gameEntries = Object.entries(jackpotData);
        let columnCount = 0;
        
        for (let i = 0; i < gameEntries.length; i++) {
            let [platformGameType, games] = gameEntries[i];
            
            if (games.length < maxGamesPerColumn) continue;
            
            columnCount++;
            const platformGameTypeParts = platformGameType.split("_");
            const platform = platformGameTypeParts[0];
            const gameType = platformGameTypeParts[1];
            let gameCount = maxGamesPerColumn;
            
            if (i === gameEntries.length - 1 && columnCount % 2 != 0) {
                gameCount = games.length;
            }
            
            const jackpotCell = templateElement.querySelector("#jackpotTd").cloneNode(true);
            const jackpotGameList = jackpotCell.querySelector("#jackpotGameUl");
            
            games.slice(0, gameCount).forEach(function(game) {
                createGameElement(game, jackpotGameList, gameType, "JACKPOT");
            });
            
            jackpotGameList.classList.add("num-" + games.length);
            jackpotCell.querySelector("#jackpotTemplate").setAttribute("jp-platform", platform);
            jackpotCell.querySelector("#jackpotTemplate").setAttribute("id", platform + "Jackpot");
            jackpotCell.querySelector("#platformIcon").classList.add("icon-" + platform);
            jackpotCell.querySelector("#gameHallGameTypeIcon").classList.add("icon-" + gameType);
            jackpotCell.querySelector("#gameHallGameTypeIcon").setAttribute("src", PageConfig.imagePrefix + "/theme/images/src-common/GAMETYPE-img/" + PageConfig.imagePublicPath + "/" + gameType + ".webp");
            jackpotCell.querySelector("#gameHallGrand_Platform_GameType").setAttribute("id", "gameHallGrand_" + platform + "_" + gameType);
            jackpotCell.querySelector("#jackpotWinner").setAttribute("onclick", "JackpotHandler.getJackpotsWinner('" + platform + "','" + gameType + "');");
            
            jackpotTable.appendChild(jackpotCell);
            hasContent = true;
            
            if (columnCount % 2 == 0 && 0 != columnCount) {
                jackpotGame.appendChild(jackpotTable);
                jackpotTable = templateElement.querySelector("#jackpotDivTb").cloneNode(true);
                hasContent = false;
            }
        }
        
        if (hasContent) {
            jackpotTable.classList.add("w-100per");
            jackpotGame.appendChild(jackpotTable);
        }
        
        if (jackpotData) {
            jackpotGame.style.display = "block";
        }
    }

    GameHallHandler.openLoginPopup = function(element) {
        if (!($j(element).hasClass(PageConfig.cricket) && "WINBDT" == PageConfig.brand)) {
            PopupUtil.openModal("#modal-loginNew");
            $j("#account")[0].focus();
        }
    };

    GameHallHandler.openMenu = function() {
        if ($j("#language").is(".open")) {
            document.getElementById("language").classList.remove("open");
        } else {
            document.getElementById("language").classList.add("open");
        }
    };

    GameHallHandler.changeLang = function(language) {
        window.onbeforeunload = null;
        const currentUrl = window.location.href;
        const langPattern = /(lang=).*?(&|$)/;
        
        if (langPattern.test(currentUrl)) {
            window.location.href = currentUrl.replace(langPattern, "$1" + language + "$2");
        } else if (-1 == currentUrl.indexOf("?")) {
            window.location.href = currentUrl + "?lang=" + language;
        } else {
            window.location.href = currentUrl + "&lang=" + language;
        }
    };

    GameHallHandler.isAtGameTypePage = (gameType, platform) => 
        GameHallHandler.getActiveTabPageWrapper().find(".sub-menu-box > .sub-menuLv2 > #" + gameType.toLowerCase() + "_logo_" + platform.toUpperCase()).hasClass("select");

    GameHallHandler.isAtGameHall = () => $j("#gameHallSection").is(":visible");

    GameHallHandler.isAtGamePage = () => $j("#gamePageDiv > .game-wrap > div > .normalGameList:visible").is(":visible");

    GameHallHandler.getPlatformAtActiveGameTypePage = pageWrapper => {
        if (pageWrapper.is(":visible")) {
            return pageWrapper.find(".game-wrap ul.normalGameList:visible").attr("platform");
        }
    };

    GameHallHandler.getActiveTabPageWrapper = () => $j("#gameHallSection:visible, #gamePageDiv:visible");

    GameHallHandler.getChallengeGameInfoListWrapper = pageWrapper => pageWrapper.find(".bonusEventChallengeGameInfo");

    GameHallHandler.getNormalGameListWrapper = pageWrapper => pageWrapper.find(".normalGameList:visible");

    GameHallHandler.openMenuIframe = function(element) {
        if (!PageConfig.isMobile) {
            if ($j(element).attr("path").toLowerCase().includes("inbox")) {
                PopupUtil.openIframe($j(element).attr("path"));
            } else {
                window.open($j(element).attr("path"), "_blank", "width=1300,height=600,top=5,left=5,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=no,location=no,directories=no");
            }
            return;
        }
        
        JCache.get("#popframe").attr("src", $j(element).attr("path"));
        JCache.get("#popTitle").text($j(element).find("#title").html() || $j(element).attr("value"));
        JCache.get("body").addClass("body-report-iframe");
        JCache.get("body").addClass("body-iframe");
        PopupUtil.openModal("#pop_inpage");
    };

    GameHallHandler.buildSimpleGameList = function(platform, container, callback) {
        $j.ajax({
            type: "POST",
            url: PageConfig.getSimpleGameListUrl,
            data: { platform: platform },
            success: function(response) {
                if (null == response || $j.isEmptyObject(response) || response.error) {
                    if (response.error) {
                        alert(response.error);
                    }
                    callback(false);
                    return;
                }
                
                response.forEach(game => {
                    createGameElement(game, container, game.gameType);
                });
                callback(true);
            },
            error: function(error) {
                callback(false);
            }
        });
    };

    GameHallHandler.triggerPreviousClose = function() {
        const checkbox1 = JCache.get("#previousPageChkBtn1").prop("checked");
        const checkbox2 = JCache.get("#previousPageChkBtn2").prop("checked");
        
        if (checkbox1 && checkbox2) {
            $j("#previousPageClose").show();
            $j("#previousPageCloseBtn").removeClass("disabled");
        } else {
            $j("#previousPageClose").hide();
            $j("#previousPageCloseBtn").addClass("disabled");
        }
    };

})();