"undefined" == typeof RaceWinEntranceHandler && (RaceWinEntranceHandler = {}),
  (function () {
    let e = [],
      t = [],
      n = "",
      a = "/theme/media/music/challengeResult.mp3",
      o = !0,
      i = !0;
    function r(e) {
      let t = PageConfig.raceWinInfo ? PageConfig.raceWinInfo.length : 0;
      postAjax({
        type: "POST",
        url: PageConfig.getRaceWinByShUrl,
        data: {
          syncUserId: PageConfig.shSyncUserId,
          isSearchAll: !0,
          raceWinDataLength: t,
        },
        success: function (t) {
          null == t || $j.isEmptyObject(t) || t.error
            ? t.error && alert(t.error)
            : ((PageConfig.raceWinInfo = t),
              RaceWinEntranceHandler.buildContent(t, e));
        },
        complete: function () {
          setTimeout(function () {
            r(!1);
          }, 1e4);
        },
      });
    }
    function l(e, t, n, o) {
      if (!t[n]) return;
      let { prizeArr: i, gameInfo: r } = t[n];
      if (!i || o >= i.length) return void l(e, t, n + 1, 0);
      let s = document
        .getElementById("raceWinContent" + t[n].settingId)
        .safeSelector("#gameIcon");
      (r.imgUrl = s.getAttribute("src").replace(/\?.*$/, "")),
        c(e.safeSelector("#gameIcon"), r, "w"),
        e
          .safeSelector("#platformIcon")
          .setAttribute(
            "src",
            PageConfig.imagePrefix +
              "/theme/images/src-common/PLATFORM-img/100x100/" +
              r.platform +
              "-logo.webp"
          ),
        PopupUtil.openModal(`#${e.getAttribute("id")}`),
        (e.safeSelector("#prize").textContent = i[o]),
        AudioPlayer.playMusicOnLoad(a, a),
        setTimeout(function () {
          PopupUtil.closeModal(`#${e.getAttribute("id")}`),
            setTimeout(function () {
              l(e, t, n, o + 1);
            }, 500);
        }, 3e3);
    }
    function c(e, t, n) {
      if (t.imgUrl) {
        let a = t.imgUrl;
        "" != n && (a = a.replace(".webp", "-" + n + ".webp")),
          e.setAttribute("src", a);
      }
      e.setAttribute("platform", t.platform),
        e.setAttribute("game_code", t.gameCode),
        e.setAttribute("game_key", t.gameKey),
        e.setAttribute("gameType", t.gameType),
        e.setAttribute("onclick", "RaceWinEntranceHandler.playGame(this)");
    }
    function s(e, t, n) {
      clearInterval(e.data("timeIntervalId")),
        d(e, t)
          ? e.data(
              "timeIntervalId",
              setInterval(function () {
                d(e, t) || g(n);
              }, 1e3)
            )
          : g(n);
    }
    function d(e, t) {
      let n = Math.max(0, parseInt((new Date(t) - new Date()) / 1e3)),
        a = ("" + Math.floor(n / 3600)).padStart(2, "0"),
        o = ("" + Math.floor((n % 3600) / 60)).padStart(2, "0"),
        i = ("" + (n % 60)).padStart(2, "0");
      return (
        e.find("#clockHour").text(a),
        e.find("#clockMinute").text(o),
        e.find("#clockSecond").text(i),
        !(n <= 0) || (clearInterval(e.data("timeIntervalId")), e.remove(), !1)
      );
    }
    function f(n, a) {
      return "JDB" == n
        ? e.length > 0 && e.includes(a)
        : "JILI" != n || (t.length > 0 && t.includes(a));
    }
    function m(e, t) {
      return t
        ? NumberFormatUtil.formatNumber(e, 0) + "X"
        : (e = parseInt(e)) >= 1e6
        ? e / 1e6 + "M"
        : e >= 1e3
        ? e / 1e3 + "K"
        : e;
    }
    function g(e) {
      e &&
        ($j("#raceWinLi" + e)
          .find("#infoStamp")
          .hide(),
        $j("#raceWinLi" + e)
          .find("#replayBtn")
          .hide(),
        $j("#raceWinLi" + e).removeClass("win"),
        $j("#raceWinLi" + e).removeClass("is-you"),
        "typeC" == PageConfig.raceWinEntranceType &&
          $j("#raceWinLi" + e)
            .find("#raceWinDetail")
            .removeClass("is-received"),
        $j("#raceWinDetail" + e)
          .find("#infoStamp")
          .hide(),
        $j("#raceWinDetail" + e)
          .find("#stampUser")
          .html(""),
        $j("#raceWinDetail" + e).removeClass("win"));
    }
    (RaceWinEntranceHandler.init = function () {
      (e = PageConfig.jdbSupReplayGameIds
        ? PageConfig.jdbSupReplayGameIds.split(",")
        : []),
        (t = PageConfig.jiliSupReplayGameIds
          ? PageConfig.jiliSupReplayGameIds.split(",")
          : []),
        PageConfig.isLogin || r(!0),
        AudioPlayer.init();
    }),
      (RaceWinEntranceHandler.buildContent = function (e) {
        if (
          ((function (e) {
            let t = e.length,
              n = 0 == t,
              a = PageConfig.raceWinEntranceType,
              o = $j("#raceWinSection"),
              i = $j("#raceWinArea"),
              r = "typeA" === a ? o : i;
            r.toggle(!n),
              "typeA" === a &&
                i
                  .addClass("raceWin-box")
                  .removeClass("oneBox twoBox")
                  .addClass(t > 1 ? "twoBox" : "oneBox");
            if (n) return;
            r.find('[id^="raceWinContent"]')
              .show()
              .filter(".show-maintain, .show-blocked")
              .hide();
          })(e),
          o)
        ) {
          let e = document.getElementById("raceWinAlert");
          document.body.insertBefore(e, document.body.firstChild),
            PopupUtil.closeModal("#raceWinAlert"),
            "" != PageConfig.raceWinSettingId &&
              (raceWinArea.style.display = "");
        }
        let t = [];
        if (
          (e.forEach((e) => {
            let n = e.rewardSetting,
              a = 1 == e.rankType,
              i = e.id,
              r = e.gameInfo,
              l = r.gameType,
              d = e.platform;
            if (o && PageConfig.showPromoGameTypeByPlatform)
              if (PageConfig.showPromoGameTypeByPlatform.has(l)) {
                PageConfig.showPromoGameTypeByPlatform.get(l).add(d);
              } else
                PageConfig.showPromoGameTypeByPlatform.set(l, new Set([d]));
            let p = document.getElementById("raceWinContent" + i);
            if (e.comingSoon) {
              if (!p) {
                let t = "";
                ("typeA" != PageConfig.raceWinEntranceType &&
                  "typeC" != PageConfig.raceWinEntranceType) ||
                  (t = "w"),
                  (p = document
                    .getElementById("raceWinComingSoonTemplate")
                    .content.cloneNode(!0)),
                  p
                    .safeSelector("#raceWinComingSoon")
                    .classList.add(a ? "winRatio" : "winAmount"),
                  p
                    .safeSelector("#raceWinComingSoon")
                    .classList.add("needToUpdateStatusClass"),
                  p
                    .safeSelector("#raceWinComingSoon")
                    .setAttribute("platform", d),
                  p
                    .safeSelector("#raceWinComingSoon")
                    .setAttribute("id", "raceWinContent" + i),
                  p
                    .safeSelector("#platformIcon")
                    .setAttribute(
                      "src",
                      PageConfig.imagePrefix +
                        "/theme/images/src-common/PLATFORM-img/100x100/" +
                        e.platform +
                        "-logo.webp"
                    ),
                  c(p.safeSelector("#gameIcon"), r, t),
                  "typeC" == PageConfig.raceWinEntranceType
                    ? raceWinArea.insertBefore(
                        p,
                        raceWinArea.safeSelector("#raceWinBottom")
                      )
                    : raceWinArea.append(p),
                  (p = document.getElementById("raceWinContent" + i)),
                  s($j("#raceWinContent" + i), e.startTime);
              }
              return;
            }
            let u = document.getElementById("raceWinModal" + i);
            if (!u) {
              (u = document
                .getElementById("raceWinModalTemplate")
                .content.cloneNode(!0)),
                (u.safeSelector("#description").innerHTML = e.tipText),
                u
                  .safeSelector("#raceWinModal")
                  .classList.add(a ? "winRatio" : "winAmount"),
                u
                  .safeSelector("#raceWinModal")
                  .classList.add("needToUpdateStatusClass"),
                u.safeSelector("#raceWinModal").setAttribute("platform", d),
                u
                  .safeSelector("#raceWinModal")
                  .setAttribute("id", "raceWinModal" + i),
                u
                  .safeSelector("#platformIcon")
                  .setAttribute(
                    "src",
                    PageConfig.imagePrefix +
                      "/theme/images/src-common/PLATFORM-img/100x100/" +
                      e.platform +
                      "-logo.webp"
                  ),
                document.body.append(u),
                (u = document.getElementById("raceWinModal" + i));
              let t = u.safeSelector("#gameIcon");
              c(t, r, "w"),
                u
                  .safeSelector("#btnPlay")
                  .addEventListener("click", function () {
                    t.click();
                  });
            }
            if (!p) {
              (p = document
                .getElementById("raceWinWinAmountTemplate")
                .content.cloneNode(!0)),
                ("typeA" != PageConfig.raceWinEntranceType &&
                  "typeB" != PageConfig.raceWinEntranceType) ||
                  (PageConfig.isLogin &&
                    p
                      .safeSelector("#modalBtn")
                      .addEventListener("click", () => {
                        PopupUtil.openModal(`#raceWinModal${i}`),
                          $j(`#raceWinModal${i}`).find("#closeBtn").show(),
                          $j(`#raceWinModal${i}`)
                            .find("#closeBtn, #modalMask")
                            .click(function () {
                              PopupUtil.closeModal(`#raceWinModal${i}`);
                            });
                      })),
                p
                  .safeSelector("#raceWinContent")
                  .classList.add(a ? "winRatio" : "winAmount"),
                p
                  .safeSelector("#raceWinContent")
                  .classList.add("needToUpdateStatusClass"),
                p.safeSelector("#raceWinContent").setAttribute("platform", d),
                p
                  .safeSelector("#raceWinContent")
                  .setAttribute("id", "raceWinContent" + i),
                p
                  .safeSelector("#modalBtn")
                  .setAttribute("data-modalId", `#raceWinModal${i}`),
                p
                  .safeSelector("#platformIcon")
                  .setAttribute(
                    "src",
                    PageConfig.imagePrefix +
                      "/theme/images/src-common/PLATFORM-img/100x100/" +
                      e.platform +
                      "-logo.webp"
                  );
              let t = Object.keys(n).length;
              if (
                (p.safeSelector("#contentList").classList.add("num-" + t),
                "typeC" == PageConfig.raceWinEntranceType
                  ? raceWinArea.insertBefore(
                      p,
                      raceWinArea.safeSelector("#raceWinBottom")
                    )
                  : raceWinArea.append(p),
                (p = document.getElementById("raceWinContent" + i)),
                "typeC" != PageConfig.raceWinEntranceType)
              ) {
                let e = p.safeSelector("#gameIcon"),
                  t = "typeA" == PageConfig.raceWinEntranceType ? "t" : "";
                c(e, r, t),
                  p
                    .safeSelector("#contentList")
                    .addEventListener("click", function () {
                      e.click();
                    });
              }
              console.log("bindDraggingEvent"),
                (function (e) {
                  let t,
                    n,
                    a = !1,
                    o = !1,
                    i = 5;
                  e.on("mousedown", function (i) {
                    (a = !0),
                      (o = !1),
                      (t = i.pageX),
                      (n = e.scrollLeft()),
                      $j("body").css("cursor", "grabbing"),
                      i.preventDefault();
                  }),
                    e.on("mouseup", function (e) {
                      (a = !1),
                        $j("body").css("cursor", "default"),
                        e.preventDefault();
                    }),
                    e.on("mouseleave", function (e) {
                      (a = !1),
                        $j("body").css("cursor", "default"),
                        e.preventDefault();
                    }),
                    e.on("mousemove", function (r) {
                      if (a) {
                        r.preventDefault();
                        const a = r.pageX - t;
                        Math.abs(a) >= i && (o = !0), e.scrollLeft(n - a);
                      }
                    });
                  let r = e.get(0);
                  r &&
                    r.addEventListener(
                      "click",
                      function (e) {
                        o && (e.preventDefault(), (o = !1));
                      },
                      !0
                    );
                })($j("#raceWinContent" + i).find("#contentList"));
            }
            let y = r.platform + "_" + r.gameCode;
            PageConfig.hasRaceWinGameCode[y] = i;
            let W = [];
            for (let t in n) {
              let l = n[t],
                d = l.id,
                y = i + "_" + d,
                C = "raceWinLi" + y,
                S = document.getElementById(C),
                I = 1 == l.isYou;
              if (!S) {
                if (
                  ((S = document
                    .getElementById("raceWinLiTemplate")
                    .content.cloneNode(!0)),
                  "typeC" == PageConfig.raceWinEntranceType)
                ) {
                  PageConfig.isLogin &&
                    S.safeSelector("#btnInfo").addEventListener("click", () => {
                      PopupUtil.openModal(`#raceWinModal${i}`),
                        $j(`#raceWinModal${i}`).find("#closeBtn").show(),
                        $j(`#raceWinModal${i}`)
                          .find("#closeBtn, #modalMask")
                          .click(function () {
                            PopupUtil.closeModal(`#raceWinModal${i}`);
                          });
                    }),
                    S.safeSelector("#btnInfo").setAttribute(
                      "data-modalId",
                      `#raceWinModal${i}`
                    ),
                    S.safeSelector("#platformIcon").setAttribute(
                      "src",
                      PageConfig.imagePrefix +
                        "/theme/images/src-common/PLATFORM-img/100x100/" +
                        e.platform +
                        "-logo.webp"
                    );
                  let t = S.safeSelector("#gameIcon");
                  c(t, r, "w"),
                    S.safeSelector("#prizeInfo").addEventListener(
                      "click",
                      function () {
                        t.click();
                      }
                    );
                }
                S.safeSelector("#raceWinLi").setAttribute("id", C),
                  (S.safeSelector("#prize").textContent =
                    NumberFormatUtil.formatNumber(l.name, 0)),
                  (S.safeSelector("#targetAmt").textContent = m(l.target, a)),
                  p.safeSelector("#contentList").append(S),
                  (S = p.safeSelector("#" + C));
              }
              if (l.takenUserName) {
                S.classList.toggle("is-you", I);
                let e = !1;
                if (
                  ("typeC" != PageConfig.raceWinEntranceType ||
                  S.safeSelector("#raceWinDetail").classList.contains(
                    "is-received"
                  )
                    ? S.classList.contains("win") ||
                      (S.classList.add("win"), (e = !0))
                    : (S.safeSelector("#raceWinDetail").classList.add(
                        "is-received"
                      ),
                      (e = !0)),
                  e)
                ) {
                  (S.safeSelector("#infoStamp").style.display = "block"),
                    (S.safeSelector("#stampUser").textContent =
                      l.takenUserName);
                  let e = l.gameInfoJson;
                  if (
                    (f(e.platform, e.gameCode) &&
                      ((S.safeSelector("#replayBtn").style.display = "block"),
                      PageConfig.isLogin &&
                        S.safeSelector("#replayBtn").setAttribute(
                          "onclick",
                          `RaceWinEntranceHandler.getOutsideGameDetail(${l.gameInfoJson}, "${l.currency}")`
                        )),
                    "false" === l.rankComplete)
                  ) {
                    let e = parseInt(l.nextQuotaAvailableTime),
                      t = "raceWinNextRankComingSoonDetail" + y,
                      n = document
                        .getElementById("raceWinNextRankComingSoonTemplate")
                        .content.cloneNode(!0);
                    n
                      .safeSelector("#raceWinNextRankComingSoonDetail")
                      .setAttribute("id", t),
                      0 === $j("#" + t).length && S.append(n),
                      s($j("#" + t), e, y),
                      S.classList.toggle("show-next", !0);
                  }
                }
              } else g(y);
              let P = document.getElementById("raceWinDetail" + i + "_" + d);
              if (
                (P ||
                  ((P = document
                    .getElementById("raceWinDetailTemplate")
                    .content.cloneNode(!0)),
                  (P.safeSelector("#prize").textContent =
                    NumberFormatUtil.formatNumber(l.name, 0)),
                  (P.safeSelector("#targetAmt").textContent = m(l.target, a)),
                  P.safeSelector("#raceWinDetail").setAttribute(
                    "id",
                    "raceWinDetail" + i + "_" + d
                  ),
                  u.safeSelector("#content").append(P),
                  (P = document.getElementById("raceWinDetail" + i + "_" + d))),
                l.takenUserName)
              ) {
                let e = !1;
                if (
                  (P.classList.contains("win") ||
                    (P.classList.add("win"), (e = !0)),
                  P.classList.toggle("is-you", I),
                  e)
                ) {
                  (P.safeSelector("#infoStamp").style.display = "block"),
                    (P.safeSelector("#stampUser").textContent =
                      l.takenUserName);
                  let e = l.gameInfoJson;
                  f(e.platform, e.gameCode) &&
                    ((P.safeSelector("#replayBtn").style.display = "block"),
                    PageConfig.isLogin &&
                      P.safeSelector("#replayBtn").setAttribute(
                        "onclick",
                        `RaceWinEntranceHandler.getOutsideGameDetail(${l.gameInfoJson}, "${l.currency}")`
                      ));
                  let t = !1,
                    n = P.getAttribute("data-recordId"),
                    a = l.takenRecordId;
                  (n && n === a) ||
                    (P.setAttribute("data-recordId", a), (t = !0)),
                    !o &&
                      I &&
                      t &&
                      W.push(NumberFormatUtil.formatNumber(l.name, 0));
                }
              } else g(y);
            }
            if (
              (GameHallUtils.slidingEffect(
                "#raceWinContent" + i,
                "#contentList",
                "li"
              ),
              W.length > 0)
            ) {
              let e = { prizeArr: W, gameInfo: r, settingId: i };
              t.push(e);
            }
          }),
          t.length > 0)
        ) {
          let e = localStorage.getItem("focusFrame");
          if (PageConfig.frameID != e) return;
          l(document.getElementById("raceWinAlert"), t, 0, 0);
        }
        o = !1;
      }),
      (RaceWinEntranceHandler.getOutsideGameDetail = function (e, t) {
        WindowEventUtil.stopEvent(event, !0, !0),
          postAjax({
            url: PageConfig.outsideDetail,
            async: !1,
            type: "POST",
            data: {
              platform: e.platform,
              webSiteType: e.webSiteType,
              gameCode: e.gameCode,
              playerId: e.playerId,
              platformTxId: e.platformTxId,
              roundId: e.roundId,
              reverseBPColor: "false",
              currency: t,
            },
            success: function (t) {
              t.error
                ? alert(t.error)
                : ((e.replayUrl = t.path),
                  PageConfig.isMobile
                    ? GameHallUtils.isBS()
                      ? (JCache.get("#popframe").attr("src", e.replayUrl),
                        JCache.get("#popTitle").text(
                          I18N.get("player.report.outstanding.replay")
                        ),
                        JCache.get("body").addClass("body-report-iframe"),
                        JCache.get("body").addClass("body-iframe"),
                        PopupUtil.openModal("#pop_inpage"))
                      : ($j("#popframe")
                          .attr("src", e.replayUrl)
                          .parent()
                          .show(),
                        $j("#popTitle").text(
                          I18N.get("player.report.outstanding.replay")
                        ),
                        $j("#gameHallHeader").hide(),
                        $j("#gameMenuTab").hide(),
                        $j("#gameHallDiv").hide())
                    : e.replayUrl && window.open(e.replayUrl));
            },
            loadingMask: "#loading",
          });
      }),
      (RaceWinEntranceHandler.open = function (e) {
        if (PageConfig.raceWinInfo) {
          let t = PageConfig.raceWinInfo.find((t) => t.id === e);
          t && RaceWinEntranceHandler.buildModalContent(t);
        } else
          setTimeout(function () {
            RaceWinEntranceHandler.open(e);
          }, 500);
        RaceWinEntranceHandler.modalOpen(e);
      }),
      (RaceWinEntranceHandler.modalOpen = function (e) {
        let t = $j("#raceWinModal" + e);
        t.find("#modalFooter").hide(),
          t.find("#closeBtn").hide(),
          PopupUtil.openModal(`#raceWinModal${e}`),
          (n = e),
          $j("#tournamentBtn").attr(
            "onclick",
            "RaceWinEntranceHandler.showDetail()"
          ),
          $j("#tournamentBtn").show();
      }),
      (RaceWinEntranceHandler.showDetail = function () {
        let e = $j("#raceWinModal" + n);
        PopupUtil.openModal(`#raceWinModal${n}`),
          e.find("#closeBtn, #modalMask").click(function () {
            PopupUtil.closeModal(`#raceWinModal${n}`);
          }),
          e.find("#closeBtn").show();
      }),
      (RaceWinEntranceHandler.showModalFooter = function (e) {
        let t = $j(e).data("modalid");
        $j(t).find("#modalFooter").show();
      }),
      (RaceWinEntranceHandler.playGame = function (e) {
        WindowEventUtil.stopEvent(e, !0, !0),
          PageConfig.isLogin
            ? PageConfig.isMobile
              ? GameHallHandler.play(e, !1, !0)
              : GameHallHandler.play(e, !1)
            : GameHallHandler.openLoginPopup(this);
      }),
      (RaceWinEntranceHandler.buildModalContent = function (e) {
        e &&
          (i &&
            (function (e) {
              let t = e.id,
                n = 1 == e.rankType;
              if (e.comingSoon) return;
              let a = e.rewardSetting,
                o = e.gameInfo,
                i = e.platform,
                r = document.getElementById("raceWinModal" + t);
              r ||
                ((r = document
                  .getElementById("raceWinModalTemplate")
                  .content.cloneNode(!0)),
                (r.safeSelector("#description").innerHTML = e.tipText),
                r
                  .safeSelector("#raceWinModal")
                  .classList.add(n ? "winRatio" : "winAmount"),
                r
                  .safeSelector("#raceWinModal")
                  .classList.add("needToUpdateStatusClass"),
                r.safeSelector("#raceWinModal").setAttribute("platform", i),
                r
                  .safeSelector("#raceWinModal")
                  .setAttribute("id", "raceWinModal" + t),
                r
                  .safeSelector("#platformIcon")
                  .setAttribute(
                    "src",
                    PageConfig.imagePrefix +
                      "/theme/images/src-common/PLATFORM-img/100x100/" +
                      e.platform +
                      "-logo.webp"
                  ),
                document.body.append(r),
                (r = document.getElementById("raceWinModal" + t)));
              c(r.safeSelector("#gameIcon"), o, "w");
              for (let e in a) {
                let o = a[e],
                  i = o.id,
                  l = document.getElementById("raceWinDetail" + t + "_" + i);
                if (
                  (l ||
                    ((l = document
                      .getElementById("raceWinDetailTemplate")
                      .content.cloneNode(!0)),
                    (l.safeSelector("#prize").textContent = o.name),
                    (l.safeSelector("#targetAmt").textContent = m(o.target, n)),
                    l
                      .safeSelector("#raceWinDetail")
                      .setAttribute("id", "raceWinDetail" + t + "_" + i),
                    r.safeSelector("#content").append(l),
                    (l = document.getElementById(
                      "raceWinDetail" + t + "_" + i
                    ))),
                  o.takenUserName)
                ) {
                  let e = !1;
                  if ("false" === o.rankComplete) {
                    let t = parseInt(o.nextQuotaAvailableTime);
                    Math.max(0, parseInt((new Date(t) - new Date()) / 1e3)) >
                      0 &&
                      (l.classList.contains("win") ||
                        (l.classList.add("win"), (e = !0)));
                  } else
                    l.classList.contains("win") ||
                      (l.classList.add("win"), (e = !0));
                  if (e) {
                    l.classList.toggle("is-you", "true" == o.isYou),
                      (l.safeSelector("#infoStamp").style.display = "block"),
                      (l.safeSelector("#stampUser").textContent =
                        o.takenUserName);
                    let e = o.gameInfoJson;
                    f(e.platform, e.gameCode) &&
                      ((l.safeSelector("#replayBtn").style.display = "block"),
                      PageConfig.isLogin &&
                        l
                          .safeSelector("#replayBtn")
                          .setAttribute(
                            "onclick",
                            `RaceWinEntranceHandler.getOutsideGameDetail(${o.gameInfoJson}, "${o.currency}")`
                          ));
                  }
                } else
                  (l.safeSelector("#infoStamp").style.display = "none"),
                    (l.safeSelector("#replayBtn").style.display = "none");
              }
            })(e),
          (function (e, t) {
            if (e) {
              let a = [],
                o = e.rewardSetting;
              for (let e in o) {
                let i = o[e],
                  r = "true" == i.isYou,
                  l = i.id,
                  c = i.takenRecordId;
                if (t) {
                  c && PageConfig.raceWinPrizeInfo.set(e, c);
                  continue;
                }
                if (
                  PageConfig.raceWinPrizeInfo.has(e) &&
                  PageConfig.raceWinPrizeInfo.get(e) === c
                )
                  continue;
                let s = document.getElementById("raceWinDetail" + n + "_" + l);
                if (i.takenUserName) {
                  console.log("value['takenUserName']", i.takenUserName),
                    PageConfig.raceWinPrizeInfo.set(e, c),
                    s.classList.toggle("is-you", r),
                    s.classList.toggle("win", !0),
                    (s.safeSelector("#infoStamp").style.display = "block"),
                    (s.safeSelector("#stampUser").textContent =
                      i.takenUserName);
                  let t = i.gameInfoJson;
                  console.log("gameInfo", t),
                    f(t.platform, t.gameCode) &&
                      (console.log("isGameCodeSupReplay"),
                      (s.safeSelector("#replayBtn").style.display = "block"),
                      PageConfig.isLogin &&
                        s
                          .safeSelector("#replayBtn")
                          .setAttribute(
                            "onclick",
                            `RaceWinEntranceHandler.getOutsideGameDetail(${i.gameInfoJson}, "${i.currency}")`
                          )),
                    r && a.push(NumberFormatUtil.formatNumber(i.name, 0));
                } else
                  PageConfig.raceWinPrizeInfo.has(e) &&
                    (PageConfig.raceWinPrizeInfo.delete(e),
                    (s.safeSelector("#infoStamp").style.display = "none"),
                    (s.safeSelector("#stampUser").textContent = ""),
                    s.classList.toggle("is-you", !1),
                    s.classList.toggle("win", !1));
              }
              if (a.length > 0) {
                let t = localStorage.getItem("focusFrame");
                if (PageConfig.frameID != t) return;
                let n = document.getElementById("raceWinAlert");
                (n.style.display = ""),
                  l(
                    n,
                    [{ gameInfo: e.gameInfo, prizeArr: a, settingId: e.id }],
                    0,
                    0
                  );
              }
              return e.complete;
            }
          })(e, i),
          (i = !1));
      });
  })();
