"undefined" == typeof JackpotHandler && (JackpotHandler = {}),
  (function () {
    let t = !1;
    (JackpotHandler.processJackpots = function (e, o, n) {
      e.error
        ? alert(e.error)
        : ((function (t) {
            PageConfig.jackpotDatas = [];
            let e = {};
            for (let a of t) {
              if (!a.platform) continue;
              let t = {
                  platform: a.platform,
                  gameType: a.gameType,
                  rawGrand: a.grand,
                  grand: NumberFormatUtil.formatNumber(a.grand, 2),
                  major: NumberFormatUtil.formatNumber(a.major, 2),
                  minor: NumberFormatUtil.formatNumber(a.minor, 2),
                  bonusId: a.bonusId,
                  jpBonusRatio: a.jpBonusRatio,
                },
                o = e[a.platform] || 0;
              (e[a.platform] = o + (a.grand - 0)),
                PageConfig.jackpotDatas.push(t);
            }
            PageConfig.jackpotDatas.sort(
              (t, a) => e[a.platform] - e[t.platform] || a.rawGrand - t.rawGrand
            );
          })(e),
          "function" == typeof n
            ? n(PageConfig.jackpotDatas)
            : (!GameHallUtils.isRWD() && !GameHallUtils.isBS()) ||
              PageConfig.isGameList
            ? (function (e) {
                for (let p of e) {
                  var o = p.grand,
                    n = p.major,
                    i = p.minor,
                    r = p.platform,
                    s = p.gameType,
                    l = s.toLowerCase();
                  if (t) {
                    let t = r + "_" + l;
                    a("#Grand_" + t, o), a("#Major_" + t, n);
                  }
                  let e = r + "_" + s;
                  if (
                    (a("#gameHallGrand_" + e, o),
                    a("#gameHallMajor_" + e, n),
                    "JDB" == r &&
                      (a("#JDBGrand", o),
                      a("#JDBMajor", n),
                      a("#JDBMinor", i),
                      a("#JDBSubGrand", o),
                      a("#JDBSubMajor", n),
                      a("#JDBSubMinor", i)),
                    p.bonusId)
                  ) {
                    if (PageConfig.isGameListPage) {
                      let t = $j("#gameListJackpotDiv").attr("platform"),
                        e = $j("#gameListJackpotDiv").attr("gameType");
                      t == r &&
                        e == s &&
                        ($j("#gameListJackpotDiv").addClass("show-JPSticky"),
                        $j(".jackpotList-btn").addClass("show-promoDot"),
                        0 ==
                          $j("#gameListJackpotDiv").find("#jpStickySpan")
                            .length &&
                          $j("#gameListJackpotDiv").prepend(
                            '<span id="jpStickySpan" class="JP-promoSticky">' +
                              p.jpBonusRatio +
                              "</span>"
                          ));
                    }
                    PageConfig.isInGameJSPPage &&
                      ($j("#" + s + "_" + r).addClass("show-JPSticky"),
                      0 ==
                        $j("#" + s + "_" + r)
                          .children("a")
                          .find("#jpStickySpan").length &&
                        $j("#" + s + "_" + r)
                          .children("a")
                          .prepend(
                            '<span id="jpStickySpan" class="JP-promoSticky">' +
                              p.jpBonusRatio +
                              "</span>"
                          ));
                    let t = $j(`#${r}_${s}_ENTRY`);
                    t.find("#jpStickyDiv").html(p.jpBonusRatio),
                      t.find("#jpStickyDiv").show();
                    let e = $j(`#jackpot_${r}_${s}`);
                    e.find("#jpStickyDiv").html(p.jpBonusRatio),
                      e.find("#jpStickyDiv").show();
                    let a = $j(".big-jackpot[jp-platform=" + r + "]");
                    a.find("#jpStickyDiv").html(p.jpBonusRatio),
                      a.find("#jpStickyDiv").show(),
                      a.find("#jackpotWinner").addClass("show-promoDot"),
                      $j(".section-JACKPOT[jp-platform=" + r + "]")
                        .find("#jackpotWinner")
                        .addClass("show-promoDot");
                    let o = $j(
                      ".platformFilter[filtertype=" +
                        r +
                        "][filterGameType=" +
                        s +
                        "]"
                    );
                    o.addClass("show-JPSticky"),
                      o.find("#jackpotWinner").addClass("show-JPSticky"),
                      0 == o.find("#jpStickySpan").length &&
                        o
                          .find(".img-platform-logo")
                          .prepend(
                            '<span id="jpStickySpan" class="JP-promoSticky">' +
                              p.jpBonusRatio +
                              "</span>"
                          ),
                      (o = $j(
                        "li[data-value=" + r + "][gametype-value=" + s + "]"
                      )),
                      o.addClass("show-JPSticky"),
                      o.find("#jackpotWinner").addClass("show-JPSticky"),
                      0 == o.find("#jpStickySpan").length &&
                        o
                          .find(".platformATag")
                          .prepend(
                            '<span id="jpStickySpan" class="JP-promoSticky">' +
                              p.jpBonusRatio +
                              "</span>"
                          );
                    let n = $j(
                      ".img-platform-logo[data-value=" +
                        r +
                        "][gametype-value=" +
                        s +
                        "]"
                    );
                    n.closest("li").addClass("show-JPSticky"),
                      0 == n.find("#jpStickySpan").length &&
                        n.prepend(
                          '<span id="jpStickySpan" class="JP-promoSticky">' +
                            p.jpBonusRatio +
                            "</span>"
                        );
                  }
                }
                t = !0;
              })(PageConfig.jackpotDatas)
            : JackpotHandler.buildGameJackpot(PageConfig.jackpotDatas));
    }),
      (JackpotHandler.getJackpots = function (t, e, a) {
        $j.ajax({
          url: PageConfig.getJackpotsUrl,
          data: { currencyType: t, platform: e },
          async: !1,
          type: "POST",
          success: function (t) {
            JackpotHandler.processJackpots(t, e, a);
          },
          error: function (t, e, a) {
            400 == t.statusCode().status && $j("#logout").trigger("click"),
              t.responseText && alert($j.parseJSON(t.responseText).error);
          },
        }),
          setTimeout(function () {
            JackpotHandler.getJackpots(t, e, a);
          }, 10050);
      }),
      (JackpotHandler.getJackpotGames = function (t, e, a) {
        $j.ajax({
          url: PageConfig.getJackpotGamesUrl,
          data: {
            webSiteType: PageConfig.webSiteType,
            shId: PageConfig.shId,
            platform: e,
            maxGameCount: 24,
          },
          async: !1,
          type: "POST",
          success: function (a) {
            !(function (t) {
              let e = document.getElementById("nav-tab");
              $j(e).addClass("num-" + Object.entries(t).length);
              let a = document.getElementById("tab-content");
              (e.innerHTML = ""), (a.innerHTML = "");
              let o = document.getElementById("gameJackpotTemplate");
              for (let i = 0; i < Object.entries(t).length; i++) {
                let r = Object.entries(t)[i][0],
                  s = Object.entries(t)[i][1],
                  l = r.split("_"),
                  p = l[0],
                  c = l[1],
                  m = o.safeSelector("#jackpotTabTemplate").cloneNode(!0),
                  d = r + "tab";
                m.setAttribute("id", r + "_JACKPOT"),
                  m.setAttribute("href", "#" + d),
                  GameHallUtils.isRWD()
                    ? ((m.safeSelector("#imgPlatformLogo").textContent = p),
                      m.appendChild(document.createTextNode(c)))
                    : (GameHallUtils.setPlatformImg(m, "#imgPlatformLogo", p),
                      m
                        .safeSelector("#platformIcon")
                        .classList.add("icon-" + p),
                      m
                        .safeSelector("#gameHallGameTypeIcon")
                        .classList.add("icon-" + c));
                let g = o.safeSelector("#tabContentTemplate").cloneNode(!0);
                g.setAttribute("id", d),
                  g.setAttribute("aria-labelledby", d),
                  g.setAttribute("tabindex", i);
                let f = g.safeSelector("#gameWrapperUl");
                if (
                  (GameHallUtils.isBS() && f.classList.add("num-" + s.length),
                  s.forEach(function (t) {
                    n(
                      t,
                      p,
                      f,
                      "tabJackpotGameTemplate",
                      GameHallUtils.isBS() ? "MHB" : "JACKPOT",
                      c
                    );
                  }),
                  0 == i)
                ) {
                  m.classList.add("active"),
                    g.classList.add("active"),
                    g.classList.add("show"),
                    document
                      .getElementById("jackpotWrapper")
                      .setAttribute(
                        "onclick",
                        `JackpotHandler.getJackpotsWinner('${p}','${c}')`
                      );
                }
                e.appendChild(m),
                  a.appendChild(g),
                  GameHallUtils.slidingEffect("#" + d, "#gameWrapperUl", "li");
              }
              PageConfig.bonusEvents &&
                PageConfig.bonusEvents.forEach(function (t) {
                  BonusEventHandler.buildGameTag(t);
                });
            })(a),
              Object.entries(a).length > 0 &&
                ($j("#jackpotArea").show(), JackpotHandler.getJackpots(t, e));
          },
          error: function (t, e, a) {
            400 == t.statusCode().status && $j("#logout").trigger("click"),
              t.responseText && alert($j.parseJSON(t.responseText).error);
          },
        });
      }),
      (JackpotHandler.buildAndAnimateNewLogin = (t) => {
        let e,
          o = $j("#newJpBox .jackpot-table");
        if (0 != o.length)
          for (let n of t) {
            let t = n.platform,
              i = n.gameType,
              r = t + "_" + i,
              s = $j("#jpRow" + r);
            0 == s.length &&
              ((s = $j("#jpRowTemplate")
                .clone()
                .attr("id", "jpRow" + r)),
              s.find("#grand").attr("id", "grand" + r),
              s.find("#major").attr("id", "major" + r),
              s
                .find("#jackpotWinner")
                .attr(
                  "onclick",
                  "JackpotHandler.getJackpotsWinner('" + t + "','" + i + "');"
                ),
              s.find("#logoIcon").attr("class", "icon-" + t),
              s.find("#jpIcon").attr("src", I18N.get("gameTypeImgUrl", [i])),
              o.find("tbody").append(s.show())),
              t != e && s.find("#logoIcon").show(),
              n.bonusId &&
                (0 == s.find("#jpStickyDiv").length &&
                  t != e &&
                  s
                    .find("#platformLogoTd")
                    .append(
                      '<div id="jpStickyDiv" class="JP-promoSticky">' +
                        n.jpBonusRatio +
                        "</div>"
                    ),
                s.find("#jackpotWinner").addClass("show-promoDot"),
                s.find("#platformLogoTd").addClass("JP-promo")),
              (e = t),
              a("#grand" + r, n.grand, !0),
              a("#major" + r, n.major, !0);
          }
      }),
      (JackpotHandler.getJackpotsWinner = function (t, e) {
        $j.ajax({
          url: PageConfig.getJackpotsWinnerUrl,
          data: {
            currencyType: PageConfig.playerCurrency,
            platform: t,
            gameType: e,
          },
          async: !1,
          type: "POST",
          success: function (t) {
            t.error
              ? alert(t.error)
              : (function (t, e) {
                  $j("#jpWinnerLayoutList > li:gt(0)").remove(),
                    $j("#jackpotWinnerList .img-platformLogo").remove(),
                    $j("#jackpotWinnerList .modal-mask").attr(
                      "id",
                      "modalMask"
                    ),
                    $j("#JPBonusInfoDiv").remove();
                  let a = "icon-" + e;
                  $j("#gameTypeIcon").attr("class", "icon " + a);
                  let o =
                    '<img class="img-platformLogo" src="' +
                    PageConfig.imagePrefix +
                    "/theme/images/src-common/PLATFORM-img/100x100/" +
                    t.Platform +
                    '-logo.webp">';
                  if (($j("#jpTitle").after(o), t.hasJPBonusEvent)) {
                    let e = "";
                    t.JPEventWinLimit && parseFloat(t.JPEventWinLimit) > 0
                      ? (e +=
                          'Jackpot prize over <span class="txt-bonus ' +
                          PageConfig.playerCurrency +
                          '">' +
                          t.JPEventWinLimit +
                          "</span> ")
                      : (e += "Winning the Jackpot "),
                      (e +=
                        "can get extra " + t.JPEventExtraBonus + "% bonus!");
                    let a =
                      '<div class="info-box" id="JPBonusInfoDiv"><div class="JP-promoSticky">' +
                      t.JPEventExtraBonus +
                      "</div><p>" +
                      t.JPEventPeriod +
                      "</p><p>" +
                      e +
                      "</p></div>";
                    $j("#jpWinnerLayout").prepend(a);
                  }
                  let n = !1;
                  $j.each(JSON.parse(t.JPWinnerList), function (t, e) {
                    let a = e.platform,
                      o = e.userId,
                      i = NumberFormatUtil.formatNumber(e.jackpotAmt, 2),
                      r = (e.gameType, e.currency),
                      s = e.syncUserId,
                      l = $j("#templateWinnerInfo").clone();
                    l.attr("id", "jpWinner" + t + "_" + a),
                      (function (t) {
                        let e = String(t);
                        for (; e.length < 3; ) e = "0" + e;
                        return e;
                      })(e.webSiteType) +
                        o ==
                        PageConfig.playerSyncUserId &&
                        ((s = PageConfig.playerName),
                        l.attr("class", "modal-layoutItem win-jp"));
                    let p = DateUtil.format(
                      new Date(
                        e.updateTime.replace(
                          /(\d{2})-(\d{2})-(\d{4})/,
                          "$2/$1/$3"
                        )
                      ).addHours(new Date().getTimezoneOffset() / -60 - 8),
                      "dd-MM-yyyy hh:mm:ss"
                    );
                    if (
                      (l
                        .find("#templateJpWinDate")
                        .html(p + DateUtil.getTimeZoneGMT()),
                      l.find("#templateJpWinName").text(s),
                      l.find("#templateCurrencySymbol").text(i),
                      l
                        .find("#templateCurrencySymbol")
                        .attr("class", "txt-bonus " + r),
                      parseFloat(e.jackpotBonusRatio) > 0)
                    ) {
                      (PageConfig.chosenCurrency
                        ? PageConfig.chosenCurrency
                        : PageConfig.playerCurrency) === e.originalCurrency &&
                        (n = !0),
                        l
                          .find("#jackpotExtraRatio")
                          .text(
                            MathUtil.decimal.multiply(e.jackpotBonusRatio, 100)
                          );
                      let t = `<p class="extra-bonus" id="extraBonus">\n\t\t\t\t\t\t${NumberFormatUtil.formatNumber(
                        e.jackpotBonusAmount,
                        2
                      )}</p>`;
                      l.find("#templateWinbonus").append(t);
                    } else l.find("#jackpotExtraRatio").remove();
                    $j("#jpWinnerLayoutList").append(l.show());
                  }),
                    $j(".extraBonusDiv, .extra-bonus, .win-percent").toggle(n),
                    $j("#jackpotWinnerList")
                      .find("#closeBtn, #modalMask")
                      .click(function () {
                        PopupUtil.closeModal("#jackpotWinnerList");
                      }),
                    PopupUtil.openModal("#jackpotWinnerList");
                })(t, e);
          },
          error: function (t, e, a) {
            400 == t.statusCode().status && $j("#logout").trigger("click"),
              t.responseText && alert($j.parseJSON(t.responseText).error);
          },
        });
      }),
      (JackpotHandler.animateNumber = []);
    const e = {};
    function a(t, a, o) {
      const n = $j(t);
      if (!o && !n.is(":visible")) return;
      let i = n.text();
      if (!i) return void n.text(a);
      if (i === a) return void (e[t] = 0);
      if (e[t] && e[t] < 5) return void e[t]++;
      if (
        ((i = i.replace(/\$|\,/g, "")), (a = a.replace(/\$|\,/g, "")) - i <= 0)
      )
        n.text(NumberFormatUtil.formatNumber(a, 2));
      else {
        e[t] = 1;
        var r = Math.pow(10, 2);
        JackpotHandler.animateNumber[t] = n.prop("number", i * r).animateNumber(
          {
            number: a * r,
            numberStep: function (t, e) {
              var a = Math.floor(t) / r,
                o = $j(e.elem);
              (a = a.toFixed(2)),
                o.prop("number", t).text(NumberFormatUtil.formatNumber(a, 2));
            },
            easing: "easeInQuad",
          },
          1e4
        );
      }
    }
    function o(t) {
      let e = $j("#" + t.platform + "_" + t.gameType + "_JACKPOT");
      return (
        e.attr("platform", t.platform),
        e.attr("gameType", t.gameType),
        e.attr("jackpotAmount", t.grand),
        e.attr("jackpotBonusRatio", t.jpBonusRatio),
        e.hasClass("active")
      );
    }
    function n(t, e, a, o, n, i) {
      let r = document
        .getElementById("gameJackpotTemplate")
        .safeSelector("#" + o)
        .cloneNode(!0);
      r
        .safeSelector("#gameImg")
        .setAttribute("src", GameHallUtils.getImgUrl(t, e, t.gameType)),
        r.setAttribute("platform", e),
        r.setAttribute("id", t.platform + "_" + t.gameKey),
        r.setAttribute("game_code", t.gameCode),
        GameHallUtils.isW() &&
          (r.safeSelector("#gameName").textContent =
            GameHallUtils.getGameDisplayName(t)),
        r.classList.add(e),
        GameHallUtils.isBS() &&
          (r.classList.add("show-bonus"),
          (r.safeSelector("#gameNameP").style.display = "block"),
          (r.safeSelector("#gameNameP").textContent =
            GameHallUtils.getGameDisplayName(t)),
          r.safeSelector("#mhbTag").remove(),
          r.setAttribute("gameType", t.gameType)),
        "MHB" == n &&
          ((r.safeSelector("#targetAmt").innerHTML =
            NumberFormatUtil.formatNumber(t.mustHitByValue, 2)),
          (r.safeSelector("#accumulatedAmt").innerHTML =
            NumberFormatUtil.formatNumber(t.mustHitByPool, 2))),
        r.setAttribute("bonusEvent", "true"),
        (GameHallUtils.isRWD() || GameHallUtils.isBS()) &&
          GameEleCache.put(t, r),
        a.appendChild(r);
    }
    (JackpotHandler.buildGameJackpot = function (t) {
      let e = GameHallUtils.isRWD() || GameHallUtils.isBS(),
        n = null,
        i = $j("#stickerGrand").attr("platform"),
        r = $j("#stickerGrand").attr("gameType");
      for (let s of t) {
        let t = o(s);
        if (
          ("" == i && "" == r
            ? e
              ? t && (n = s)
              : (null == n || parseInt(n.rawGrand) < parseInt(s.rawGrand)) &&
                (n = s)
            : i == s.platform &&
              r == s.gameType &&
              (a("#stickerGrand", s.grand),
              0 != s.jpBonusRatio
                ? ($j("#jackpotTagValue").text(s.jpBonusRatio),
                  $j("#jackpotTag").show())
                : $j("#jackpotTag").hide()),
          s.bonusId)
        ) {
          let t = s.platform + "_" + s.gameType + "_JACKPOT";
          0 == $j("#" + t).find("#jpStickyDiv").length &&
            $j("#" + t).prepend(
              '<div id="jpStickyDiv" class="JP-promoSticky">' +
                s.jpBonusRatio +
                "</div>"
            );
          let e = $j(
            "li[platform=" +
              s.platform +
              "][gametype=" +
              s.gameType +
              "][jp-platform=" +
              s.platform +
              "]"
          );
          e.addClass("show-JPSticky"),
            0 == e.find("#jpStickyDiv").length &&
              e
                .find("#gameTagArea")
                .prepend(
                  '<span id="jpStickyDiv" class="JP-promoSticky">' +
                    s.jpBonusRatio +
                    "</span>"
                ),
            $j(
              "#stickerGrand[platform=" +
                s.platform +
                "][gametype=" +
                s.gameType +
                "]"
            )
              .closest(".txt-number")
              .addClass("show-promoDot");
        }
      }
      "" == i &&
        "" == r &&
        n &&
        ($j("#stickerGrand").attr("platform", n.platform),
        $j("#stickerGrand").attr("gameType", n.gameType),
        0 != n.jpBonusRatio
          ? ($j("#jackpotTagValue").text(n.jpBonusRatio),
            $j("#jackpotTag").show())
          : $j("#jackpotTag").hide(),
        a("#stickerGrand", n.grand));
    }),
      (JackpotHandler.setJackpotSticker = function (t) {
        let e = t.id.split("_")[0],
          a = t.id.split("_")[1],
          o = document.getElementById("gameJackpotSticker");
        o || (o = document.getElementById("jackpotWrapper")),
          o.setAttribute(
            "onclick",
            `JackpotHandler.getJackpotsWinner('${e}','${a}')`
          );
        let n = $j("#jackpotArea #stickerGrand");
        n.attr("platform", e),
          n.attr("gametype", a),
          n.closest(".txt-number").removeClass("show-promoDot"),
          JackpotHandler.animateNumber["#stickerGrand"] &&
            JackpotHandler.animateNumber["#stickerGrand"].stop(),
          "0" == t.getAttribute("jackpotBonusRatio")
            ? $j("#jackpotTag").hide()
            : ($j("#jackpotTagValue").text(t.getAttribute("jackpotBonusRatio")),
              $j("#jackpotTag").show()),
          n.text(t.getAttribute("jackpotAmount"));
      });
  })();
