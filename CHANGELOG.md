## [4.40.0](https://github.com/atom-minimap/minimap/compare/v4.39.14...v4.40.0) (2021-07-13)

### Bug fixes and Improvements

- getDevicePixelRatio will return 0 on Linux resulting in no minimap (#799)
- remove LegacyAdapter - Drop support for Atom versions older than 1.52. (#798)
- use StyleReader from atom-ide-base (#798)
- improve debounce function (#798)
- update dependencies

## [4.39.14](https://github.com/atom-minimap/minimap/compare/v4.39.13...v4.39.14) (2021-05-10)


### Bug Fixes

* don't destory the dummty decoration ([fd61554](https://github.com/atom-minimap/minimap/commit/fd615543502a54334c6a9d94e370d4c5b4cee263))
* don't emit if the decoration is already destroyed ([30ad2d6](https://github.com/atom-minimap/minimap/commit/30ad2d606fe42a20ee151319757e4894ab605006))
* make the old decorations API type-safe ([a94020a](https://github.com/atom-minimap/minimap/commit/a94020a160161fdd309188591e0f50bbc4383494))
* remove excess return null ([930ba15](https://github.com/atom-minimap/minimap/commit/930ba15b4868daa08926d62d57ebe2b13f8c30b2))
* return a real destroyed decoration ([473d82c](https://github.com/atom-minimap/minimap/commit/473d82c9d746e81289a4dda1a21394e79b3be920))
* return destoryed decoration and disposable on fallback ([bd4eb25](https://github.com/atom-minimap/minimap/commit/bd4eb25df94234b10901bb115671f8b954d09bf2))

## [4.39.13](https://github.com/atom-minimap/minimap/compare/v4.39.12...v4.39.13) (2021-04-14)


### Bug Fixes

* rotateHue accepts negative hue values in DOMStylesReader ([2e6f047](https://github.com/atom-minimap/minimap/commit/2e6f04778870ee9d8820d41cf5c45184b6ecb4c4))

## [4.39.12](https://github.com/atom-minimap/minimap/compare/v4.39.11...v4.39.12) (2021-04-02)


### Bug Fixes

* remove preventDefault from onMouseWheel for independent scroll ([02527ff](https://github.com/atom-minimap/minimap/commit/02527ff47584f332a46fd45f8e215c4aeedc3b64))

## [4.39.11](https://github.com/atom-minimap/minimap/compare/v4.39.10...v4.39.11) (2021-04-01)


### Bug Fixes

* update dependencies ([5b7c457](https://github.com/atom-minimap/minimap/commit/5b7c45703d40388f3c3696cec1b8202b040e284c))

## [4.39.10](https://github.com/atom-minimap/minimap/compare/v4.39.9...v4.39.10) (2021-03-12)


### Bug Fixes

* disable desynchronized canvas ([8059189](https://github.com/atom-minimap/minimap/commit/8059189e862f440d7a6bc5377e60d66b0b49a632))

## [4.39.9](https://github.com/atom-minimap/minimap/compare/v4.39.8...v4.39.9) (2021-02-19)


### Bug Fixes

* invalidate styles cache on styles update ([12b1b07](https://github.com/atom-minimap/minimap/commit/12b1b07a25a1ae12ae34f109d089e4ea8fb3cb03))

## [4.39.8](https://github.com/atom-minimap/minimap/compare/v4.39.7...v4.39.8) (2021-02-09)


### Bug Fixes

* fix minimap on left calculate width ([4133274](https://github.com/atom-minimap/minimap/commit/4133274b8f011971a6ec8c08a4f8d71d5a9a0f07))

## [4.39.7](https://github.com/atom-minimap/minimap/compare/v4.39.6...v4.39.7) (2021-02-02)


### Bug Fixes

* view provider returns correct minimap element ([#781](https://github.com/atom-minimap/minimap/issues/781)) ([358d781](https://github.com/atom-minimap/minimap/commit/358d781114d85f5214cfdf46433dba9d33a6b5c2))

## [4.39.6](https://github.com/atom-minimap/minimap/compare/v4.39.5...v4.39.6) (2021-01-30)

### Bug fixes
- fix: do not null set the values in destroy (#779): solves some of the null bugs.

## [4.39.5](https://github.com/atom-minimap/minimap/compare/v4.39.4...v4.39.5) (2021-01-18)


### Bug Fixes

* fix strange null-bugs (#771)
* fix `getDecorations` should return an array


## [4.39.4](https://github.com/atom-minimap/minimap/compare/v4.39.3...v4.39.4) (2021-01-18)


### Bug Fixes

* revert "fix: skip rendering empty token text" ([86767a0](https://github.com/atom-minimap/minimap/commit/86767a08dde8d7eb2d6c3931862ea8f0c4a86900))

## [4.39.3](https://github.com/atom-minimap/minimap/compare/v4.39.2...v4.39.3) (2021-01-18)


### Bug Fixes

* skip rendering empty token text ([6bd1921](https://github.com/atom-minimap/minimap/commit/6bd1921213b7bce935f21340a0aee42b909a78ab))

## [4.39.2](https://github.com/atom-minimap/minimap/compare/v4.39.1...v4.39.2) (2021-01-18)


### Bug Fixes

* add minimap.destroy to minimapForEditor just in case ([40a4676](https://github.com/atom-minimap/minimap/commit/40a467623a257732f54824e7a8a99f14ade706c9))
* dispose the editorSubscription if minimap is deactivated before destroying the editor ([7b359b3](https://github.com/atom-minimap/minimap/commit/7b359b364343fb575e46fcee41b9812a553ecfb1))

## [4.39.1](https://github.com/atom-minimap/minimap/compare/v4.39.0...v4.39.1) (2021-01-17)


### Bug Fixes

* add DecorationManagement.destroy ([09e64b9](https://github.com/atom-minimap/minimap/commit/09e64b9b0141dc3e7d5a76aa6a5246975c8a3de2))
* attach to text editor explicitly ([f2c36b7](https://github.com/atom-minimap/minimap/commit/f2c36b759bf33cbd6b374ed60901452e600ac0c0))
* clear editorsMinimaps in one take ([aa48eba](https://github.com/atom-minimap/minimap/commit/aa48eba2a0c151c194845704fe82cd79c95fa7cf))
* compare minimap with undefined ([ad83bf6](https://github.com/atom-minimap/minimap/commit/ad83bf66448d11761b10c04799bc15fc7141fe16))
* create a new Minimap if it is destroyed ([503c482](https://github.com/atom-minimap/minimap/commit/503c482ffc1e85cbb83a52570e4930300c893f87))
* delete the editor from editorsMinimaps if destroyed ([defc58c](https://github.com/atom-minimap/minimap/commit/defc58ced3b29cd8a414c5e67993900c20ecc521))
* destroy quickSettingsElement ([0eace20](https://github.com/atom-minimap/minimap/commit/0eace2096f47c59e84d93dbb72eb601fb4a154bd))
* do not define additional subs variable ([2b665ec](https://github.com/atom-minimap/minimap/commit/2b665ec259798dd9ed3b439c375068f7538f5601))
* hack for forcing scroller movement ([a5ac5ec](https://github.com/atom-minimap/minimap/commit/a5ac5ec950cd4ac168ff0e24a0a5c3cbd8772410))
* merge subs.add in Minimap ([5a9ff08](https://github.com/atom-minimap/minimap/commit/5a9ff0820ddb65074e9e6e9f53589df3c090f028))
* merge subs.add in quick settings ([4e81b4c](https://github.com/atom-minimap/minimap/commit/4e81b4c56c0767fe58b320f7059a99d4d40ee450))
* only delete if editorsMinimaps is not null ([464a8cf](https://github.com/atom-minimap/minimap/commit/464a8cfc371524c950c875b030009dc250c981d0))
* remove excess copy ([4fca672](https://github.com/atom-minimap/minimap/commit/4fca672d1e3e02f0203fa19b3fb7de6ed3e3eac6))
* removeChild before appending ([1d07ed1](https://github.com/atom-minimap/minimap/commit/1d07ed154be2f1d5b864f9f972bf155845160513))
* reuse minimapElement if already exists ([1043a29](https://github.com/atom-minimap/minimap/commit/1043a29f3721beb11871639febc1b298e6519193))
* set minimap to null if it is truthy ([3f683d9](https://github.com/atom-minimap/minimap/commit/3f683d9305fd770f0723d0b216ecea083cadbbc5))
* use minimapViewProvider instead of atom.views ([6fb75af](https://github.com/atom-minimap/minimap/commit/6fb75aff8feff0f7dc0c16db64ca029a0acd6e9c))

# [4.39.0](https://github.com/atom-minimap/minimap/compare/v4.38.3...v4.39.0) (2021-01-16)


### Bug Fixes

* add destroyed  prop to DecorationManagement ([784732d](https://github.com/atom-minimap/minimap/commit/784732df2a84b88d4ac6bb76e09ecd971c5ad6a6))
* call initializeDecorations inside setModel ([006300c](https://github.com/atom-minimap/minimap/commit/006300c89c4b0019a50c2559cf6c794583336a7c))
* destructure data in drawGutterDecoration ([c055f0e](https://github.com/atom-minimap/minimap/commit/c055f0eaac32a173539b8ebbbf3936e3a736ac1f))
* destructure data in drawLineDecoration ([7579528](https://github.com/atom-minimap/minimap/commit/7579528abf74823927991b4f3475050d9c7c7e3a))
* destructure renderData in drawHighlightDecoration ([8033509](https://github.com/atom-minimap/minimap/commit/80335099d5886bd60afe0259b7d659cb11971da5))
* destructure renderData in drawHighlightOutlineDecoration ([be58182](https://github.com/atom-minimap/minimap/commit/be5818245328f185fd87200bc8a721211928e71f))
* duplicate functions for backward compatibility ([67d9d58](https://github.com/atom-minimap/minimap/commit/67d9d587511ce1cad8321c82ec3562983e1d2ad5))
* empty minimapElement once minimapElement is destroyed ([c5ac30c](https://github.com/atom-minimap/minimap/commit/c5ac30ca7aa8d32dcfd5eaf23d10665693343be2))
* fix onDidChangeDecorationRange ([b331f08](https://github.com/atom-minimap/minimap/commit/b331f08609008b8f849555e4b5fd33bd7d81f3f2))
* make DecorationManagement a normal class ([a303916](https://github.com/atom-minimap/minimap/commit/a3039161141fa9a500efeed456b3db0117839682))
* memoize this.DecorationManagement ([5d4c1dc](https://github.com/atom-minimap/minimap/commit/5d4c1dc1f294e1310c7f6f562189774e2062070d))
* memoize this.emitter ([6235c2e](https://github.com/atom-minimap/minimap/commit/6235c2ef36b84d8aa69365cff9d02f1c01d0fc29))
* set this.DecorationManagement  to undefined ([b9e351c](https://github.com/atom-minimap/minimap/commit/b9e351c9270c43b9e6c810528cf8e2a93eb8279d))
* use this.minimap.destroyed ([38a0e3f](https://github.com/atom-minimap/minimap/commit/38a0e3f8bf908c46776a4844d42a7174fb9c6482))
* use this.minimap.editorDestroyed ([9385892](https://github.com/atom-minimap/minimap/commit/938589282e26594c9d53a56c86eab233892e6c22))
* use this.minimap.emitter ([f34cd85](https://github.com/atom-minimap/minimap/commit/f34cd85f37b25a2f4c1a856b33ec0bbcfca7bf36))
* use this.minimap.get visibleRow ([ea3fc7b](https://github.com/atom-minimap/minimap/commit/ea3fc7b6455985fbd53e42a3abad9a6db9ef129a))


### Features

* add getDecorationManagement as the recommended way of using decoration API ([46080b3](https://github.com/atom-minimap/minimap/commit/46080b3481a4dc36a4cbbb734b6fa6ae9191aa6f))
* set minimapElement  property for Minimap ([03726ed](https://github.com/atom-minimap/minimap/commit/03726ede6950bc94259473110d41ef2bf9a2e746))

## [4.38.3](https://github.com/atom-minimap/minimap/compare/v4.38.2...v4.38.3) (2021-01-12)


### Bug Fixes

* make underscore-plus a devDep ([07512f3](https://github.com/atom-minimap/minimap/commit/07512f32aca7e30a6a3f52332f62e1241d565e1a))
* no need escape / ([2687541](https://github.com/atom-minimap/minimap/commit/2687541b53e6b8f6c2b466b4f37f365f9b506c86))
* replace underscore-plus by custom implementation ([2ee74b9](https://github.com/atom-minimap/minimap/commit/2ee74b9c730e6836a8c3e00b64681a305598b6e6))
* store the regexp in a const ([2a64ecb](https://github.com/atom-minimap/minimap/commit/2a64ecbd76db73bf2bb2fd3571d21b8e246308dd))
* turn-off toplevel optimizations  ([0099863](https://github.com/atom-minimap/minimap/commit/009986300506416aa30b3f1c9a326f6160cceb19))
* use string inerpolation ([92be9d8](https://github.com/atom-minimap/minimap/commit/92be9d8c538eb21dbc5ed4931c9aa47afa79ea92))

## [4.38.2](https://github.com/atom-minimap/minimap/compare/v4.38.1...v4.38.2) (2021-01-12)


### Bug Fixes

* make drawBackDecorationsForLines a free function ([b2e238a](https://github.com/atom-minimap/minimap/commit/b2e238af7710bb8594acdb572a6be06636a3a48e))
* make drawDecorations a free function ([94f2a1e](https://github.com/atom-minimap/minimap/commit/94f2a1e57d8ed4100156e6464b6e77ffe36575f6))
* make drawFrontDecorationsForLines a free function ([6b97b7a](https://github.com/atom-minimap/minimap/commit/6b97b7a37201c36eccfefc8a6dcb48c9201b5c1b))
* make getDecorationColor free function ([e704de9](https://github.com/atom-minimap/minimap/commit/e704de91dc72bfb9b35b999d7cad31e9478f757e))
* make updateBackDecorationsLayer a free function ([8ae5fa4](https://github.com/atom-minimap/minimap/commit/8ae5fa41bca1a7d395dfc89f7138b0b3c85377b9))
* make updateFrontDecorationsLayer a free function ([a614182](https://github.com/atom-minimap/minimap/commit/a614182d00e28d4f98f2b56ef846fa5558320e8f))

## [4.38.1](https://github.com/atom-minimap/minimap/compare/v4.38.0...v4.38.1) (2021-01-12)


### Bug Fixes

* import domStylesReader ([10730c9](https://github.com/atom-minimap/minimap/commit/10730c9c167a33f6d5dc0eead62720af10afb7e4))

# [4.38.0](https://github.com/atom-minimap/minimap/compare/v4.37.1...v4.38.0) (2021-01-11)


### Bug Fixes

* check if dummyNode is on the targetNode ([3071ef3](https://github.com/atom-minimap/minimap/commit/3071ef36a86384d6c3f6fc547adcc993ef370311))
* do not store empty cachedData ([e181e07](https://github.com/atom-minimap/minimap/commit/e181e07fee15c0ef834b2ae28e5926ac08b61c52))
* do not use cache if no scopes are added yet ([86ae2c4](https://github.com/atom-minimap/minimap/commit/86ae2c468a2541f95ac20510f9a36b50a533ed62))
* remove non-existing token.scopeDescriptor ([70219c6](https://github.com/atom-minimap/minimap/commit/70219c68899ce2f6e50950c8b620745532bcc955)), closes [/github.com/atom/atom/blob/976cb9ef3a611163052f9d31c6c3685dc1e6c5b4/src/text-editor.js#L1432](https://github.com//github.com/atom/atom/blob/976cb9ef3a611163052f9d31c6c3685dc1e6c5b4/src/text-editor.js/issues/L1432)


### Features

* empty color cache if the theme changes ([5b12790](https://github.com/atom-minimap/minimap/commit/5b127908a2855ab84438f1f2fd52bad8450bc7c7))
* reuse domStylesReader between editors ([a605d57](https://github.com/atom-minimap/minimap/commit/a605d579ba145095ea29f253d6d8474b0eab2c13))

## [4.37.1](https://github.com/atom-minimap/minimap/compare/v4.37.0...v4.37.1) (2021-01-07)


### Bug Fixes

* drawToken: use simple comparison instead of regex ([fe56545](https://github.com/atom-minimap/minimap/commit/fe565455cbca685c0bdc1bc7cd0292c53aa20ed7))

# [4.37.0](https://github.com/atom-minimap/minimap/compare/v4.36.13...v4.37.0) (2021-01-07)


### Features

* observeAndWarn function ([65de0e0](https://github.com/atom-minimap/minimap/commit/65de0e071586e5263d20f5ea1e72426c494236c7))
* warn about poor performance if treesitter is off ([67b60c8](https://github.com/atom-minimap/minimap/commit/67b60c84cd85d62296c2921c529a2aed2d465aef))

## [4.36.13](https://github.com/atom-minimap/minimap/compare/v4.36.12...v4.36.13) (2021-01-03)


### Bug Fixes

* inline eachTokenForScreenRows + get scopes in getTokenColor ([8ce807d](https://github.com/atom-minimap/minimap/commit/8ce807d98bfccad2611ee622a28e75cf587b6a0c))
* make updateTokensLayer a free function ([02e3bf8](https://github.com/atom-minimap/minimap/commit/02e3bf83f65f5b3f7b4d48a3428f26d47935e501))
* refactor whiteSpaceRegexp out of loop ([6d2ed20](https://github.com/atom-minimap/minimap/commit/6d2ed20078ff202b0c9a6e20cda8a24dbdad021f))

## [4.36.12](https://github.com/atom-minimap/minimap/compare/v4.36.11...v4.36.12) (2021-01-03)


### Bug Fixes

* append the dummyNode only once ([8823c8f](https://github.com/atom-minimap/minimap/commit/8823c8fca33cec2f172c4d37855aab4609c24cd1))
* combine cacheData checks + use undefined for comparison of value ([8f4a87d](https://github.com/atom-minimap/minimap/commit/8f4a87dbb05221a3ba995bc34d3882ab02c2b1f1))
* faster transparentize by using string index instead of replace ([1801ec8](https://github.com/atom-minimap/minimap/commit/1801ec88ebc3a7a21ce7fda8a6e1b40af3af0897))
* inline textOpacity ([2689a9a](https://github.com/atom-minimap/minimap/commit/2689a9a5ef4eef10a6ae46dd00e03a557801458a))
* remove excess null check ([89a7756](https://github.com/atom-minimap/minimap/commit/89a775689e73e9aa12afba54a0429348cfb69914))
* require cache param ([69c7354](https://github.com/atom-minimap/minimap/commit/69c735467be3da17fb9dcb015a6358f4abc25687))

## [4.36.11](https://github.com/atom-minimap/minimap/compare/v4.36.10...v4.36.11) (2021-01-03)


### Bug Fixes

* factor dotRegexp out of the loop ([fdd23fa](https://github.com/atom-minimap/minimap/commit/fdd23fafaa8e78674eb520704cf6bb05503d6dbf))
* factor editorScreenLineCount and invisibleRegExp out of the loop ([9359279](https://github.com/atom-minimap/minimap/commit/9359279c8f4384c4119c7486dd1d18420829a5a9))
* factor emptyLineRegexp and whiteSpaceRegexp out of the loop ([8e704b0](https://github.com/atom-minimap/minimap/commit/8e704b0b063266a0ec6e3e23a7bdc329b2a453ca))
* factor hueRegexp out of the loop ([703c75c](https://github.com/atom-minimap/minimap/commit/703c75c75b39ba75986f54450f3a2ee0584f5864))
* factor rgbExtractRegexp out of the loop ([4585437](https://github.com/atom-minimap/minimap/commit/4585437cb876489483348bd611b9e681c4e0514f))

## [4.36.10](https://github.com/atom-minimap/minimap/compare/v4.36.9...v4.36.10) (2021-01-02)


### Bug Fixes

* factor out dispatchers and lambda ([aca84c0](https://github.com/atom-minimap/minimap/commit/aca84c0a995d1f129af8f8d8b21ca54a7a7ad19e))
* factor out getTokenColor lambda ([09771b6](https://github.com/atom-minimap/minimap/commit/09771b6fee63b03966575416c98e24482eddacf0))
* make drawLines a free function ([bf9f598](https://github.com/atom-minimap/minimap/commit/bf9f5983a88ec12d30cc3407f2e6b728cdd8bec1))

## [4.36.9](https://github.com/atom-minimap/minimap/compare/v4.36.8...v4.36.9) (2021-01-02)


### Bug Fixes

* comment out unused functions ([1396a49](https://github.com/atom-minimap/minimap/commit/1396a49de7b862cc4d4c10d7f32bf8e4c9b83373))
* factor out renderData from updateBackDecorationsLayer ([3b3dec1](https://github.com/atom-minimap/minimap/commit/3b3dec1181243831dee4c79c164d1c3646fb80a2))
* factor out renderData from updateFrontDecorationsLayer ([5e94c91](https://github.com/atom-minimap/minimap/commit/5e94c91b1846620a97db269f3350f773a7c956a5))
* inline redrawRangesOnLayer in updateTokensLayer ([5059ea3](https://github.com/atom-minimap/minimap/commit/5059ea34850b91b21bc34604213c236b73578c8e))
* inline updateBackDecorationsLayer ([a05bca0](https://github.com/atom-minimap/minimap/commit/a05bca0d577ebc69488df0027e012f8f91529443))
* inline updateFrontDecorationsLayer ([dacf546](https://github.com/atom-minimap/minimap/commit/dacf5465c99df96ebe61dd8b5dee86bb80688f62))
* inline variables used once in updateCanvas ([173454b](https://github.com/atom-minimap/minimap/commit/173454be8239ef5e18b3bd9a50ab26501a2dc4c2))
* move the consts out of updateTokensLayer ([bffd277](https://github.com/atom-minimap/minimap/commit/bffd277ee15a3697b81227dfdef6ee69f0287a06))
* refactor the parameters of drawLines out of loop ([436f4b7](https://github.com/atom-minimap/minimap/commit/436f4b77ee6cf4a94867cf67270be64bb7d67355))
* take the const decorations out of loop ([c3c1e5e](https://github.com/atom-minimap/minimap/commit/c3c1e5e9ff5791c7bcdac62bf9906f025186d823))

## [4.36.8](https://github.com/atom-minimap/minimap/compare/v4.36.7...v4.36.8) (2021-01-02)


### Bug Fixes

* cache the decoration drawer dispatchers ([8835572](https://github.com/atom-minimap/minimap/commit/8835572ce36dbe44355c700bbecd709371cbf3e7))
* calculate decorationColor outside the decoration drawers ([90f0e65](https://github.com/atom-minimap/minimap/commit/90f0e653c22c41e98e9bd4d28589f52c52f4b5f3))
* calculate editorElement only once outside of the drawDecorations ([2c768cb](https://github.com/atom-minimap/minimap/commit/2c768cb01472834e737db4889caed326402646e7))
* call getTextEditorElement only once ([ad4fa0e](https://github.com/atom-minimap/minimap/commit/ad4fa0e51631ff5199b447a87a8c9645bd4828d7))
* call getTextEditorElement only once in drawDecorations ([94a3064](https://github.com/atom-minimap/minimap/commit/94a306443d564c3abc8a3cc5b3f49d025e5697ff))
* call getTextEditorElement() outside of getDecorationColor ([739a561](https://github.com/atom-minimap/minimap/commit/739a561579171eac635dff20bd325232af965fa9))
* make drawCustomDecoration a free function ([4848aef](https://github.com/atom-minimap/minimap/commit/4848aefbac9766a1ca78ac3853f296788951b11c))
* make drawGutterDecoration a free function ([30e9017](https://github.com/atom-minimap/minimap/commit/30e90178a560c5e06319889bbd6457671e63be52))
* make drawHighlightDecoration a free function ([404393d](https://github.com/atom-minimap/minimap/commit/404393d546bfe709a33069b7b1d4863e3e01f172))
* make drawHighlightOutlineDecoration a free function ([cd4af73](https://github.com/atom-minimap/minimap/commit/cd4af738bd477d78ccdd1750a594e74418185198))
* make drawLineDecoration a free function ([d2b3782](https://github.com/atom-minimap/minimap/commit/d2b37823fc4f8fc5fa8f2f5b5b6e1748ac294605))

## [4.36.7](https://github.com/atom-minimap/minimap/compare/v4.36.6...v4.36.7) (2021-01-02)


### Bug Fixes

* make drawToken a free function ([ec363ea](https://github.com/atom-minimap/minimap/commit/ec363ea6fd2de23411299feae8f993c692e9a3f2))
* make eachTokenForScreenRows a free function ([a296f48](https://github.com/atom-minimap/minimap/commit/a296f4880b54dc65abc0ece57a249ec078d1a7ee))
* make getInvisibleRegExp a free function ([5e23805](https://github.com/atom-minimap/minimap/commit/5e23805005c3754565e51761f255a150ad99c48d))
* move DOMStylesReader to CanvasDrawer ([6999bc5](https://github.com/atom-minimap/minimap/commit/6999bc54dfa474192273c7993a54cc8968b1e6bf))
* move getTextEditorElement to Minimap class ([5c72224](https://github.com/atom-minimap/minimap/commit/5c72224a1ccfb3a71aa14e1f11ca8b1967f06384))
* this.minimap.getTextEditor only once in eachTokenForScreenRows ([d3d5d6e](https://github.com/atom-minimap/minimap/commit/d3d5d6eb42cbe54842ae09eb8cf88c933ab300b3))

## [4.36.6](https://github.com/atom-minimap/minimap/compare/v4.36.5...v4.36.6) (2021-01-01)


### Bug Fixes

* add domStylesCache to DOMStylesReader's constructor ([e4e9b1f](https://github.com/atom-minimap/minimap/commit/e4e9b1fa04d1d06f8042a2ba93ace0c10e006e8a))
* add hasTokenizedOnce to DOMStylesReader's constructor ([2641ae6](https://github.com/atom-minimap/minimap/commit/2641ae6bfedf01feeaebac536140d3d5cdf69879))
* add targetElement to retrieveStyleFromDom API ([81f47ed](https://github.com/atom-minimap/minimap/commit/81f47edf075432be5a1ac01174fc39eca62f0858))
* comment unused invalidateIfFirstTokenization ([346a9a3](https://github.com/atom-minimap/minimap/commit/346a9a368dc8d7c82640813082d9dbee45c94601))
* only index cachedData once ([4e753ad](https://github.com/atom-minimap/minimap/commit/4e753adf40a798764c1290f894fbae46e1ec1f6e))
* use a Map as the domStylesCache ([108918a](https://github.com/atom-minimap/minimap/commit/108918adeea2f303162f838ed17729c39dab1dcf))
* use DOMStylesReader as a class in CanvasDrawer ([a598938](https://github.com/atom-minimap/minimap/commit/a5989381734dc50883a89a7a970976af01b34b75))
* use DOMStylesReader as a class in MinimapElement ([a1c99e5](https://github.com/atom-minimap/minimap/commit/a1c99e57fd9922a3a2c0eac352e32b68f65b678b))

## [4.36.5](https://github.com/atom-minimap/minimap/compare/v4.36.4...v4.36.5) (2021-01-01)


### Bug Fixes

* make computeIntactRanges a free function ([22f541f](https://github.com/atom-minimap/minimap/commit/22f541f2c8c9877c1c7896aa458bc8e885bc184b))
* make computeRangesDiffs a free function ([115ae4f](https://github.com/atom-minimap/minimap/commit/115ae4fba246b3b05358e8ebafe224221723c6a9))
* make getOriginatorPackageName a free function ([3d67d03](https://github.com/atom-minimap/minimap/commit/3d67d03e6b6c94aaf233372de19f0429abe1db2d))
* make getPackagesDirectory a free function ([b592149](https://github.com/atom-minimap/minimap/commit/b59214991307054312366a85d432e744b65778e9))
* make isStoredInDotAtom a free function ([d1061a2](https://github.com/atom-minimap/minimap/commit/d1061a2a2095c47396a40361d1bef6f79a506d04))
* make linkPackage and installPackage free functions ([32987c7](https://github.com/atom-minimap/minimap/commit/32987c7da717762c89fc28a2459d5abeab4b99b9))
* make rotateHue a free function ([1261495](https://github.com/atom-minimap/minimap/commit/126149553f0749c252aa2d362e5307b09f6d2fe4))
* make runCommand a free function ([6ab825c](https://github.com/atom-minimap/minimap/commit/6ab825cc0fccd157c7622360134ced434f01016e))
* make transparentize a free function ([9eb52f1](https://github.com/atom-minimap/minimap/commit/9eb52f1108b35cbeef253a9fcbd535efc5252b7f))
* make truncateIntactRanges a free function ([058c2d1](https://github.com/atom-minimap/minimap/commit/058c2d158cfc09e27c97f11f6bf16d6c3c53ec02))

## [4.36.4](https://github.com/atom-minimap/minimap/compare/v4.36.3...v4.36.4) (2020-12-31)


### Bug Fixes

* mediaQuery deprecations ([3b6a0e7](https://github.com/atom-minimap/minimap/commit/3b6a0e7c7128d99faf0ec396525c121daab69ea5))

## [4.36.3](https://github.com/atom-minimap/minimap/compare/v4.36.2...v4.36.3) (2020-12-31)


### Bug Fixes

* use shorter version of object props ([d7ba069](https://github.com/atom-minimap/minimap/commit/d7ba06904645e75538858126cd80c3fa38083e66))
* use strings interpolation instead of + ([012dd00](https://github.com/atom-minimap/minimap/commit/012dd00c314473ed2791a1c96f64f9b908eaa19a))

## [4.36.2](https://github.com/atom-minimap/minimap/compare/v4.36.1...v4.36.2) (2020-12-30)


### Bug Fixes

* map existence check: use undefined compare ([ec8480a](https://github.com/atom-minimap/minimap/commit/ec8480aadf1e8d145536e5326c8ffb5718e75f84))
* use Map for decorationDestroyedSubscriptions ([661d190](https://github.com/atom-minimap/minimap/commit/661d1909db0431c836276b6658b49a62024b137b))
* use Map for decorationMarkerChangedSubscriptionsValues ([6a0d612](https://github.com/atom-minimap/minimap/commit/6a0d612085dbb4ce0cdd64ed987441c19ddbe2f2))
* use Map for decorationMarkerDestroyedSubscriptions ([f2e6515](https://github.com/atom-minimap/minimap/commit/f2e65151eda916367122b17b0e13a067b9b2c57b))
* use Map for decorationsById ([1fc7bc8](https://github.com/atom-minimap/minimap/commit/1fc7bc84dd25e34b98cb431e2ceb66260d3f624e))
* use Map for decorationsByMarkerId ([d0a2cbe](https://github.com/atom-minimap/minimap/commit/d0a2cbe7f0b8d24518d287ab21ce0ff0838a3062))
* use Map for decorationUpdatedSubscriptions ([9879ab5](https://github.com/atom-minimap/minimap/commit/9879ab5cb6026bfb14f7c967c4a0c2540bcc70de))

## [4.36.1](https://github.com/atom-minimap/minimap/compare/v4.36.0...v4.36.1) (2020-12-29)


### Bug Fixes

* remove spec specific code in production build ([15c15c5](https://github.com/atom-minimap/minimap/commit/15c15c5ae8ae852b2acd9f5a9c747f1b4b080707))

# [4.36.0](https://github.com/atom-minimap/minimap/compare/v4.35.8...v4.36.0) (2020-12-29)


### Bug Fixes

* add higher optimizations to Terser ([b3d00af](https://github.com/atom-minimap/minimap/commit/b3d00af688fe31f4e229471fe4cb2853291b8024))
* don't use anonymous function when it is named ([2f9392a](https://github.com/atom-minimap/minimap/commit/2f9392a7403ae9ee596ae90a966f6a57b7cfbfda))
* inline dragOffset and offsetTop in initial ([d44dd77](https://github.com/atom-minimap/minimap/commit/d44dd7730646f56a6acc7b9e34cfcf960c1a6183))
* make animate a free function ([cfb681b](https://github.com/atom-minimap/minimap/commit/cfb681b12aa2adf3ba76af015edc72aa932e9c8b))
* make applyStyles a free function ([7c5ab25](https://github.com/atom-minimap/minimap/commit/7c5ab255ca7e3094c113b91a98e48aca33810f68))
* make extractMouseEventData a free function ([31ca2e4](https://github.com/atom-minimap/minimap/commit/31ca2e48ce6bdb2d9d38c0128ee8f92d48997565))
* make extractTouchEventData a free function ([5ae0dcc](https://github.com/atom-minimap/minimap/commit/5ae0dcc952633444d4b90370f8af0c98ea05a469))
* make getTime a free function ([ebf816a](https://github.com/atom-minimap/minimap/commit/ebf816aa1f12c2d8ed7ef683745918a2416b7186))
* make makeScale a free function ([1d3ce49](https://github.com/atom-minimap/minimap/commit/1d3ce494114aff9d302d4c556c18f39b66890e37))
* make makeTranslate a free function ([9c5dbaf](https://github.com/atom-minimap/minimap/commit/9c5dbafa92d0241e9133a6f360b0d85b44e695f1))
* make swing a free function ([4005109](https://github.com/atom-minimap/minimap/commit/4005109763ba851744e65dfee82fc42df407bcca))
* merge adding config observers ([b500d4f](https://github.com/atom-minimap/minimap/commit/b500d4f83040879007eb26414724c7fbe55e4684))
* merge adding subs in attachedCallback ([474b4c1](https://github.com/atom-minimap/minimap/commit/474b4c19f4121116c10bb83ea5521356369e89d5))
* merge adding subs in initializeContent ([d869d39](https://github.com/atom-minimap/minimap/commit/d869d39494c23d8f514d1db9a6500d72d518fdde))
* merge adding subs in setModel ([1b1f9af](https://github.com/atom-minimap/minimap/commit/1b1f9af3a93febc5bbfc57f616dae4998f31bc54))
* mouseEvent.which deprecation ([de81494](https://github.com/atom-minimap/minimap/commit/de814940bb73372d607ce40ac33a6814a6a3a525))
* remove duplicate drag handlers ([73d9ec4](https://github.com/atom-minimap/minimap/commit/73d9ec4b87e968790000c004cdaeaeec65096ad8))
* set hoits_vars to false ([4722d21](https://github.com/atom-minimap/minimap/commit/4722d213a0a8c1a2ecf953ce8a41cc6293eaa930))


### Features

* Merge pull request [#737](https://github.com/atom-minimap/minimap/issues/737) from atom-minimap/minimap-element-module ([345f5d1](https://github.com/atom-minimap/minimap/commit/345f5d1d687010bba5581daaa9ca201c6da45162))

## [4.35.8](https://github.com/atom-minimap/minimap/compare/v4.35.7...v4.35.8) (2020-12-29)


### Bug Fixes

* add deprecation warning for LegacyAdapter ([cea6197](https://github.com/atom-minimap/minimap/commit/cea6197eef6eed428cad0cc90f92feac2b3f750d))
* add Parcel to build and optimize Minimap ([f0b001b](https://github.com/atom-minimap/minimap/commit/f0b001b155c0bc23a8d24fb70ef44574529c0c14))
* config not being defined ([12a3050](https://github.com/atom-minimap/minimap/commit/12a305022172f56ac8ad11d1ba34438fb5e5c8e0))
* do not export the private values and functions ([067a6d6](https://github.com/atom-minimap/minimap/commit/067a6d640a143d5580be760d862f64d62c94f80d))
* export directly from Main to remove race conditions ([e354143](https://github.com/atom-minimap/minimap/commit/e354143d8256cf8100519eb683b7f1cf320cdb7b))
* export directly from PluginManagement to remove race conditions ([4d9e234](https://github.com/atom-minimap/minimap/commit/4d9e234d080f87becd5ab3103c8ab81d81f2be1c))
* export plugins (used in quick-settings) ([f276547](https://github.com/atom-minimap/minimap/commit/f27654795f5cb4dcda1374c019067b577c7ae862))
* import missing deactivateAllPlugins ([a8c9b91](https://github.com/atom-minimap/minimap/commit/a8c9b91ec0c92920c9179604390ca8136508444d))
* lazy load Main because of race conditions ([948f642](https://github.com/atom-minimap/minimap/commit/948f64294c17f25ee17428cf2cc831dae090d2e5))
* lazy load MinimapPluginGeneratorElement ([392f6d9](https://github.com/atom-minimap/minimap/commit/392f6d9e546b577703e44e02df9a90213f894072))
* make config a json file ([e14d180](https://github.com/atom-minimap/minimap/commit/e14d18048237dd71b888e15f91a29c177b420bfa))
* MinimapServiceV1 ([1a4f3fa](https://github.com/atom-minimap/minimap/commit/1a4f3fa5002470ecc3c4eba90e6284cd3e158f25)), closes [/github.com/parcel-bundler/parcel/issues/5531#issuecomment-751897276](https://github.com//github.com/parcel-bundler/parcel/issues/5531/issues/issuecomment-751897276)
* move plugin-management file as it is not a mixin anymore ([dac13bd](https://github.com/atom-minimap/minimap/commit/dac13bd5ae826b87c286a28c3bcade67a2377f45))
* move provideMinimapServiceV1 to the main file ([126c62a](https://github.com/atom-minimap/minimap/commit/126c62a2d7e0e0d4391b1c84a5aecebf26d23d72))
* only imoprt the needed functions from fs-plus ([60bd9a8](https://github.com/atom-minimap/minimap/commit/60bd9a8b96f28f93055dca112c1015564bd82352))
* only import dasherize from underscore-plus ([f98f211](https://github.com/atom-minimap/minimap/commit/f98f211723a27b16f12eef0f61cbf4013b4616aa))
* remove initializePlugins ([af85b54](https://github.com/atom-minimap/minimap/commit/af85b549ebba5f75ee37fd239a1eb36e614ee6e8))
* remove lazy loading of Main ([6ad19cc](https://github.com/atom-minimap/minimap/commit/6ad19cc3cad6615d43597fd3cf5cd5c0a8af540e))
* remove require cache removal hack ([018ae7a](https://github.com/atom-minimap/minimap/commit/018ae7a48035df8bd15cb86ba55ee5678c561bc9))
* remove synchronous lazy loading ([927cc1e](https://github.com/atom-minimap/minimap/commit/927cc1e7abff65d17fe6a65e841e47767411efb5))
* use export default instead of module.exports= ([c1ab6a9](https://github.com/atom-minimap/minimap/commit/c1ab6a93b83b51b43a332cdcec742b14978f9e31))
* use imports + use Array.isArray ([a262bfb](https://github.com/atom-minimap/minimap/commit/a262bfba04971cd42611dc9e064ec8424a549117))

## [4.35.7](https://github.com/atom-minimap/minimap/compare/v4.35.6...v4.35.7) (2020-12-09)


### Bug Fixes

* add more css containment (to all selectors) ([d73aaee](https://github.com/atom-minimap/minimap/commit/d73aaee22d588935a9fb7d013490004cc6670cf2))

## [4.35.6](https://github.com/atom-minimap/minimap/compare/v4.35.5...v4.35.6) (2020-12-01)


### Bug Fixes

* remove lowLatency ([4b05971](https://github.com/atom-minimap/minimap/commit/4b0597148e499e043c4cce54f6d75d907a4f1200))

## [4.35.5](https://github.com/atom-minimap/minimap/compare/v4.35.4...v4.35.5) (2020-12-01)


### Bug Fixes

* disable desynchronized canvas on Linux ([7b3e51e](https://github.com/atom-minimap/minimap/commit/7b3e51e1b459783cb871c8c731a482489ebb55f0))

## [4.35.4](https://github.com/atom-minimap/minimap/compare/v4.35.3...v4.35.4) (2020-11-27)


### Bug Fixes

* Rename "Auto Toggle" to "Show Minimap on Atom Start" ([#728](https://github.com/atom-minimap/minimap/issues/728)) ([c35ab7a](https://github.com/atom-minimap/minimap/commit/c35ab7a91bdf29988c9a0f79dbbed8a923823d5c))

## [4.35.3](https://github.com/atom-minimap/minimap/compare/v4.35.2...v4.35.3) (2020-11-26)


### Bug Fixes

* decrease the width of scroll indicator ([06db644](https://github.com/atom-minimap/minimap/commit/06db6443d02f78ffa3ad610c734747297d7f5141))
* make scroll indicator more visible ([9384703](https://github.com/atom-minimap/minimap/commit/938470352689df47c391ea214c4bfca528fb38bf))

## [4.35.2](https://github.com/atom-minimap/minimap/compare/v4.35.1...v4.35.2) (2020-11-22)


### Bug Fixes

* add more passive:true to event listeners ([7df85b3](https://github.com/atom-minimap/minimap/commit/7df85b336bacb4c1a7e00c034475d9955eb51eba))
* Mark atom-utils event listeners as passive ([9850bec](https://github.com/atom-minimap/minimap/commit/9850bec60f2cdab653bd4855863b599f79cb94f3))

## [4.35.1](https://github.com/atom-minimap/minimap/compare/v4.35.0...v4.35.1) (2020-11-22)


### Bug Fixes

* bump atom-utils-plus ([a954c3f](https://github.com/atom-minimap/minimap/commit/a954c3fb1afbdf053fb1335727b9383247f98f16))

# [4.35.0](https://github.com/atom-minimap/minimap/compare/v4.34.0...v4.35.0) (2020-11-21)


### Bug Fixes

* requests flush changes if not already requested ([79d6e41](https://github.com/atom-minimap/minimap/commit/79d6e4117cbe009d341b89cf221b952950fdc01b))


### Features

* use requestAnimationFrame for scheduleChanges  ([2ca5006](https://github.com/atom-minimap/minimap/commit/2ca500668239342b8d5a6d670da73fc8ea6beb6d))

# [4.34.0](https://github.com/atom-minimap/minimap/compare/v4.33.0...v4.34.0) (2020-11-21)


### Bug Fixes

* less containment for minimap-quick-settings ([2747b7f](https://github.com/atom-minimap/minimap/commit/2747b7f31364e1ba5f73577e916027ae5ebe6c71))


### Features

* add css containment to minimap elements ([f2be7d9](https://github.com/atom-minimap/minimap/commit/f2be7d98fa5d61193c3f97ffbf658cae31fc47bb))

# [4.33.0](https://github.com/atom-minimap/minimap/compare/v4.32.0...v4.33.0) (2020-11-21)


### Features

* use desynchronized canvas ([d9c79ba](https://github.com/atom-minimap/minimap/commit/d9c79ba4dfad324c9223e63d2efa10f9de1406e8))

# [4.32.0](https://github.com/atom-minimap/minimap/compare/v4.31.1...v4.32.0) (2020-11-21)


### Features

* limit the number of tokens that are rendered for one line This will prevent the very long lines to break minimap when softwrap is not enabled. ([85a56e3](https://github.com/atom-minimap/minimap/commit/85a56e37c68d5c1520c5ccc83363053e7b868642))

## [4.31.1](https://github.com/atom-minimap/minimap/compare/v4.31.0...v4.31.1) (2020-11-21)


### Bug Fixes

* prevent error when minimap squished ([cfeba59](https://github.com/atom-minimap/minimap/commit/cfeba5950ce69735ca705061dc359d000a00ee8c))
* prevent error when width = 0 ([1ec8f12](https://github.com/atom-minimap/minimap/commit/1ec8f12cfda88099697d20ccdc7a57b2c6d5ec49))

# [4.31.0](https://github.com/atom-minimap/minimap/compare/v4.30.2...v4.31.0) (2020-11-21)


### Bug Fixes

* move less intensive conditions forward ([6540c39](https://github.com/atom-minimap/minimap/commit/6540c39d81c2aeaa62c87f99d2cfa56fcdd69c1a))


### Features

* use optimal settings as the default ([68a7883](https://github.com/atom-minimap/minimap/commit/68a7883d3a301ebdca136982734b3bdd75bf3653))

## [4.30.2](https://github.com/atom-minimap/minimap/compare/v4.30.1...v4.30.2) (2020-11-21)


### Bug Fixes

* Add --fix to lint ([edbfd1e](https://github.com/atom-minimap/minimap/commit/edbfd1ed12071854b0f3ab3545063e615a7b6633))
* bump dependencies ([2372942](https://github.com/atom-minimap/minimap/commit/2372942a4d26c9e9edaa1c78162b6ea16c6d55d0))
* bump dependencies ([2b887ef](https://github.com/atom-minimap/minimap/commit/2b887ef35321fa030304974d3bca3ca9a9405a0b))
* npm run lint ([4345ccf](https://github.com/atom-minimap/minimap/commit/4345ccfff7649a545f27331ad3616d2bc0962d4e))
* run lint using standard 16 ([34e4d49](https://github.com/atom-minimap/minimap/commit/34e4d49d4fe7046c72e30334d01f06fc6dc59292))
* use atom-utils-plus ([ffe2717](https://github.com/atom-minimap/minimap/commit/ffe27177f70facb685595a03000a54336cbad5c9))
* use const instead of var ([6faa975](https://github.com/atom-minimap/minimap/commit/6faa975d9979a7e104e4898c181806923b1f8b50))
* use if/else instead of complex ternary ([706a2d7](https://github.com/atom-minimap/minimap/commit/706a2d79e6153222d16a504e4a0229f675340057))

## [4.30.1](https://github.com/atom-minimap/minimap/compare/v4.30.0...v4.30.1) (2020-11-21)

### Bug Fixes

*  Startup time improvement: add activation hook ([ee3e5d7](https://github.com/atom-minimap/minimap/commit/ee3e5d7f9a6820c165371f16cc5a855a51bd61cd))

# v4.30.0 (2020-11-20)

- :sparkles: Performance improvement: [Make event listeners passive](https://github.com/atom-minimap/minimap/pull/683)
- :bug: Bug fix: [Fixed issue with this.minimap.onMouseWheel() is not a function](https://github.com/atom-minimap/minimap/pull/641)
- [Update CI and tests](https://github.com/atom-minimap/minimap/pull/710)


<a name="v4.29.9"></a>
# v4.29.9 (2018-09-20)

## :bug: Bug Fixes

- Fix documentation ([#646](https://github.com/atom-minimap/minimap/pull/646), [#670](https://github.com/atom-minimap/minimap/pull/670))

## :sparkles: Features

- Use default cursor on minimap ([#650](https://github.com/atom-minimap/minimap/pull/650))

<a name="v4.29.8"></a>
# v4.29.8 (2018-02-23)

## :bug: Bug Fixes

- Fix crash when used alongside tree-sitter grammars ([#662](https://github.com/atom-minimap/minimap/pull/662))

## Others

- Fix CI ([#673](https://github.com/atom-minimap/minimap/pull/673))

<a name="v4.29.7"></a>
# v4.29.7 (2017-09-18)

## :bug: Bug Fixes

- Guard against there being no visible screen row when the minimap is constructed ([b2012d034a](https://github.com/atom-minimap/minimap/commit/b2012d034a162e18dc4def10f9204d3d4286440d), [#626](https://github.com/atom-minimap/minimap/issues/626))

<a name="v4.29.6"></a>
# v4.29.6 (2017-08-09)

## :bug: Bug Fixes

- Adjust outline decoration rendering so that it doesn't leak over next lines ([8d0b51cc](https://github.com/atom-minimap/minimap/commit/8d0b51ccfb4bacab396e75cff12831daf0b6cfa3))
- Fix issue where decorations were not properly removed from canvas ([6c856b9b](https://github.com/atom-minimap/minimap/commit/6c856b9b30653359805d8f2a587479e61b08407e))

<a name="v4.29.5"></a>
# v4.29.5 (2017-08-09)

## :bug: Bug Fixes

- Guard against pollDocument being something other than a function ([52273e70](https://github.com/atom-minimap/minimap/commit/52273e70a9ba60bfcc44b5fdbe28748b6ed4c9bc), [#625](https://github.com/atom-minimap/minimap/issues/625))

<a name="v4.29.4"></a>
# v4.29.4 (2017-08-09)

## :bug: Bug Fixes

- Fix left minimap positioning broken in Atom 1.19 ([68357079](https://github.com/atom-minimap/minimap/commit/6835707900bd52184fc81ac7d3f9b6e7c8b83ecd), [#623](https://github.com/atom-minimap/minimap/issues/623))

<a name="v4.29.3"></a>
# v4.29.3 (2017-07-27)

## :bug: Bug Fixes

- Guard against service usage after package is disabled in the same Atom session ([2f787bc7](https://github.com/atom-minimap/minimap/commit/2f787bc7649577df3fa9976b5b833018ac4bdccc), [#605](https://github.com/atom-minimap/minimap/issues/605))

<a name="v4.29.2"></a>
# v4.29.2 (2017-07-24)

## :bug: Bug Fixes

- Properly fix the issue with deprecated scroll method ([0552856a](https://github.com/atom-minimap/minimap/commit/0552856ae4250557a43bcd6dd58e84df9e24545e))
- Fix error when redispatching scroll event ([b269eb87](https://github.com/atom-minimap/minimap/commit/b269eb87949b41a84b685f0db775f083ed44566f), [#614](https://github.com/atom-minimap/minimap/issues/614))
- Fix independent minimap no longer working on latest atom version ([29bd6b35](https://github.com/atom-minimap/minimap/commit/29bd6b35c0e1c03ceac0ae97a6c8e493a7219f92))

<a name="v4.29.1"></a>
# v4.29.1 (2017-07-24)

## :bug: Bug Fixes

- Fix call of soon to be deprecated method ([1b761f2a](https://github.com/atom-minimap/minimap/commit/1b761f2ab5242bfc25652978506749fbdb75bcf2), [#598](https://github.com/atom-minimap/minimap/issues/598))

<a name="v4.29.0"></a>
# v4.29.0 (2017-07-19)

Remove Kite promotion.

<a name="v4.28.2"></a>
# v4.28.2 (2017-05-02)

## :bug: Bug Fixes

- Fix access to deleted editor in attached callback ([03b8f952](https://github.com/atom-minimap/minimap/commit/03b8f952b63c481db466e48863033c3397a09881), [#590](https://github.com/atom-minimap/minimap/issues/590), [#591](https://github.com/atom-minimap/minimap/issues/591), [#592](https://github.com/atom-minimap/minimap/issues/592))

<a name="v4.28.0"></a>
# v4.28.0 (2017-04-27)

## :sparkles: Features

- Kite promotion ([16c11d82](https://github.com/atom-minimap/minimap/commit/16c11d82b889ce1260342e4fa7d6d1905c0fde45))

<a name="v4.27.1"></a>
# v4.27.1 (2017-04-05)

## :bug: Bug Fixes

- Fix flickers on retina screen with absolute mode adjustable height ([a81abbea](https://github.com/atom-minimap/minimap/commit/a81abbea715d329691272b3cb5d13317a50d3913))
- Enable pointer events for visible area in adjusted absolute mode ([8210e1e9](https://github.com/atom-minimap/minimap/commit/8210e1e915fe94caf08066543e86293418fe7ce8), [#564](https://github.com/atom-minimap/minimap/issues/564))

<a name="v4.27.0"></a>
# v4.27.0 (2017-03-30)

## :sparkles: Features

- Implement configurable minimap redraw delay ([c1ec247d](https://github.com/atom-minimap/minimap/commit/c1ec247d0f94497d9bdfaaded9d2315d2767d1e0))

## :racehorse: Performances

- Epic performance boost for large files ([07e65ed8](https://github.com/atom-minimap/minimap/commit/07e65ed88d31a36d49749cc1b02c1fef993faa28))

<a name="v4.26.8"></a>
# v4.26.8 (2017-01-31)

## :sparkles: Features

- Add link to the quick-highlight integration ([7d417572](https://github.com/atom-minimap/minimap/commit/7d417572c5d61d9d6c11eae97f78dd515f4c4e0c))

## :bug: Bug Fixes

- Fix access to a text editor without component ([c4cd1508](https://github.com/atom-minimap/minimap/commit/c4cd1508e2fd86ebd4e023a6a483361566638377), [#551](https://github.com/atom-minimap/minimap/issues/551))

<a name="v4.26.7"></a>
# v4.26.7 (2017-01-18)

## :bug: Bug Fixes

- Fix drag offset on 1.13+ ([93550956](https://github.com/atom-minimap/minimap/commit/93550956554dc42c547856556ce607ef64c97da8), [#551](https://github.com/atom-minimap/minimap/issues/551))

<a name="v4.26.6"></a>
# v4.26.6 (2017-01-12)

## :bug: Bug Fixes

- No longer use getScreenRange to retrieve a marker's range when destroyed

<a name="v4.26.5"></a>
# v4.26.5 (2016-12-19)

## :bug: Bug Fixes

- Fix issue on master with destroyed decorations ([5791fb28](https://github.com/atom-minimap/minimap/commit/5791fb28d0bc9a257dc3a89852b3bb5d8e4ad432))

<a name="v4.26.4"></a>
# v4.26.4 (2016-11-30)

## :bug: Bug Fixes

- Fix error raised when a pane is destroyed ([cdcd2693](https://github.com/atom-minimap/minimap/commit/cdcd269353887403eac36322d5378662ce313e92), [#489](https://github.com/atom-minimap/minimap/issues/489))

<a name="v4.26.3"></a>
# v4.26.3 (2016-11-10)

## :bug: Bug Fixes

- Fix reading tokens of lines after the last one ([1a018112](https://github.com/atom-minimap/minimap/commit/1a0181126af2912110b6f5b12cc339d784a98386))

<a name="v4.26.2"></a>
# v4.26.2 (2016-11-10)

## :racehorse: Performances

- Speed up token rendering a bit ([216f6a88](https://github.com/atom-minimap/minimap/commit/216f6a88f9e14332e743f71af18d004b120c9a54))

<a name="v4.26.1"></a>
# v4.26.1 (2016-10-20)

## :bug: Bug Fixes

- Fix invalid overlay offset when minimap is not adjusted ([73b9917c](https://github.com/atom-minimap/minimap/commit/73b9917c11813c24209d3c14ec28cbcd8b8bb2e9))
- Guard against destroyed editor in adapters and decorations manager ([252d4572](https://github.com/atom-minimap/minimap/commit/252d4572a150a4fb14260c6d89784f5da8459823), [#489](https://github.com/atom-minimap/minimap/issues/489))


<a name="v4.26.0"></a>
# v4.26.0 (2016-10-20)

This version will only supports Atom `>= 1.13.0` and drops support of shadow DOM.

## :bug: Bug Fixes

- Fix quick settings button always visible when hovering the workspace ([ca1a3d80](https://github.com/atom-minimap/minimap/commit/ca1a3d807f31520aff0a770abc5975a56adcc106))

## :arrow_up: Dependencies Update

- Bump atom engine version ([573f7f76](https://github.com/atom-minimap/minimap/commit/573f7f76164049013ca4c068da9177cb1ec29d55))
>>>>>>> d14caff3927634722a50ad3f348c676a88848ea3

<a name="v4.25.7"></a>
# v4.25.7 (2016-11-30)

## :bug: Bug Fixes

- Fix error raised when a pane is destroyed ([c5717e84](https://github.com/atom-minimap/minimap/commit/c5717e8431352bfe5c88cc206afb0d6e718d73b6), [#489](https://github.com/atom-minimap/minimap/issues/489))

<a name="v4.25.5"></a>
# v4.25.5 (2016-10-20)

## :bug: Bug Fixes

- Fix invalid overlay offset when minimap is not adjusted ([73b9917c](https://github.com/atom-minimap/minimap/commit/73b9917c11813c24209d3c14ec28cbcd8b8bb2e9))
- Guard against destroyed editor in adapters and decorations manager ([252d4572](https://github.com/atom-minimap/minimap/commit/252d4572a150a4fb14260c6d89784f5da8459823), [#489](https://github.com/atom-minimap/minimap/issues/489))

<a name="v4.25.4"></a>
# v4.25.4 (2016-10-20)

## :bug: Bug Fixes

- Fix size change handler making scrolling in the minimap impossible ([f98b54df](https://github.com/atom-minimap/minimap/commit/f98b54dfb7d0dab2315bb4825edd8eca04cb2615))

<a name="v4.25.3"></a>
# v4.25.3 (2016-10-20)

## :bug: Bug Fixes

- Fix overlay margin applied even when minimap is on the right ([240e2b0b](https://github.com/atom-minimap/minimap/commit/240e2b0b1183a183f2ae1f4a8e3a423f2ed19b2e))

<a name="v4.25.2"></a>
# v4.25.2 (2016-10-20)

## :bug: Bug Fixes

- Fix invalid css value ([3eb581d0](https://github.com/atom-minimap/minimap/commit/3eb581d0d5d3db0c577bbb97ea2c08cdb451ac98))

<a name="v4.25.1"></a>
# v4.25.1 (2016-10-20)

## :bug: Bug Fixes

- Fix overlay offsets when minimap is on the left ([a0a38169](https://github.com/atom-minimap/minimap/commit/a0a38169a384e75083caea4c219fb70f35171b31))

<a name="v4.25.0"></a>
# v4.25.0 (2016-09-02)

## :sparkles: Features

- Add option to move the cursor when clicking to scroll in the minimap ([73f84fc0](https://github.com/atom-minimap/minimap/commit/73f84fc03e0b733ce7038f0391358ec40ec31d97), [#515](https://github.com/atom-minimap/minimap/issues/515))
- Add tern-project settings ([dec0e7bd](https://github.com/atom-minimap/minimap/commit/dec0e7bd5689cf64649037c2ef658d1ba2d05f43))

## :racehorse: Performances

- Lazily load remaining dependencies ([b5419c36](https://github.com/atom-minimap/minimap/commit/b5419c36a11676d645be2eb844f081654c7c7cab))

## :arrow_up: Dependencies Update

- Bump engine version ([b4e70206](https://github.com/atom-minimap/minimap/commit/b4e702061ecb0b77a08909c98b9a10fdce400d8e))

<a name="v4.24.7"></a>
# v4.24.7 (2016-07-05)

## :bug: Bug Fixes

- Fix minimal width badly measured after a split pane ([1f97824e](https://github.com/atom-minimap/minimap/commit/1f97824e23706d10fb0c6e35da9000388d20ef46), [#497](https://github.com/atom-minimap/minimap/issues/497))
- Add guard against duplicated minimap ([d782ed65](https://github.com/atom-minimap/minimap/commit/d782ed650775d82d32e3cd0c18105ca7e82acb59), [#504](https://github.com/atom-minimap/minimap/issues/504))

<a name="v4.24.5"></a>
# v4.24.5 (2016-06-14)

## :bug: Bug Fixes

- Fix invalid invisible regexp when show invisible is disabled ([5b762a54](https://github.com/atom-minimap/minimap/commit/5b762a540bbc812df583fb67ec58c3b27432c6c7), [#502](https://github.com/atom-minimap/minimap/issues/502))

<a name="v4.24.4"></a>
# v4.24.4 (2016-06-09)

## :bug: Bug Fixes

- Fix infinite loop in scroll top listener ([46b6f1fc](https://github.com/atom-minimap/minimap/commit/46b6f1fc894f22ec8a0c40cb93bef6df616c71b8), [#491](https://github.com/atom-minimap/minimap/issues/491))

<a name="v4.24.3"></a>
# v4.24.3 (2016-05-27)

## :bug: Bug Fixes

- Use a border to offset the visible area instead of a transform ([8e65b938](https://github.com/atom-minimap/minimap/commit/8e65b9384dd226670e6054cb45bec36a43dcb4e8), [#484](https://github.com/atom-minimap/minimap/issues/484))

<a name="v4.24.2"></a>
# v4.24.2 (2016-05-25)

## :bug: Bug Fixes

- Set the with-minimap attribute in attached callback ([478e5ef7](https://github.com/atom-minimap/minimap/commit/478e5ef75b6652329f7696ffffb03b56d6ac4066), [#487](https://github.com/atom-minimap/minimap/issues/487))
- Add another guard when accessing tokenLinesForScreenRows ([80fd6533](https://github.com/atom-minimap/minimap/commit/80fd65332e396b818c67b1387742c2ddeb361c21))

<a name="v4.24.1"></a>
# v4.24.1 (2016-05-24)

## :bug: Bug Fixes

- Fix disappearing minimap on master ([9b7425f8](https://github.com/atom-minimap/minimap/commit/9b7425f88b500c9cf8ea7726a735beefbe42f560))

<a name="v4.24.0"></a>
# v4.24.0 (2016-05-21)

## :sparkles: Features

- Add a new adjustMinimapWidthOnlyIfSmaller  setting to disable CSS limitation ([cc7161e5](https://github.com/atom-minimap/minimap/commit/cc7161e57176eed177940776d994e358813fffcc), [#452](https://github.com/atom-minimap/minimap/issues/452))
- Add a with-minimal attribute on text editors ([d76d4109](https://github.com/atom-minimap/minimap/commit/d76d410924c718d78d32c9ea819d51a0a983042a))  <br>Gives a way to hide the scrollbar only when a minimap is present, as
  requested in #479

## :bug: Bug Fixes

- Fix error in minimal plugin generation dialog ([e72e2dd3](https://github.com/atom-minimap/minimap/commit/e72e2dd35bc1b65c8069d44e1e8f483260984e32), [#476](https://github.com/atom-minimap/minimap/issues/476))
- Fix error raised when emitting changes and text editor is no longer referenced ([abc29f46](https://github.com/atom-minimap/minimap/commit/abc29f4648f7c8b3966e38673162e7a6558acf2e), [#482](https://github.com/atom-minimap/minimap/issues/482))
- Add guard when calling tokenLinesForScreenRows ([fc2622f5](https://github.com/atom-minimap/minimap/commit/fc2622f561fc9508e3da12fe4e874b06ea28039b))
- Fix linter issue ([f7d1878c](https://github.com/atom-minimap/minimap/commit/f7d1878c64f6ba290b37c510f74130f8d272fd24))

<a name="v4.23.5"></a>
# v4.23.5 (2016-05-06)

## :bug: Bug Fixes

- Fix missing canvas scaling without smooth scrolling ([bff59ea5](https://github.com/atom-minimap/minimap/commit/bff59ea568f2d19b8739fefbd9540fe0fae5931f), [#480](https://github.com/atom-minimap/minimap/issues/480))
- Fix regression when reading tokens from line in old API ([a10def7c](https://github.com/atom-minimap/minimap/commit/a10def7ccf773e055cfad4be0779cebe74273a66))

<a name="v4.23.4"></a>
# v4.23.4 (2016-05-05)

## :bug: Bug Fixes

- Fix invisible characters improperly matched ([fee318ad](https://github.com/atom-minimap/minimap/commit/fee318ade62f9800a188621531b82b4331855cfc))

<a name="v4.23.3"></a>
# v4.23.3 (2016-05-04)

Little refactor to support upcoming Atom text editor feature.

<a name="v4.23.2"></a>
# v4.23.2 (2016-04-27)

## :bug: Bug Fixes

- Fix decoration event emitted when the text editor is destroyed ([e6aa7433](https://github.com/atom-minimap/minimap/commit/e6aa74339e2da1b90778bc0cc3fb7489e4509fb6), [#477](https://github.com/atom-minimap/minimap/issues/477))

<a name="v4.23.1"></a>
# v4.23.1 (2016-04-26)

Fix linter issues.

<a name="v4.23.0"></a>
# v4.23.0 (2016-04-26)

## :sparkles: Features

- Add a quick setting control to switch the adjust absolute mode height setting ([94d3be1a](https://github.com/atom-minimap/minimap/commit/94d3be1aaf52f85b587e8082d49542a0ce08b11c))
- Add a news setting to adjust the height of canvases in absolute mode ([17e02f42](https://github.com/atom-minimap/minimap/commit/17e02f427cc36c010b9c87febbb776fcbeffa0ca), [#344](https://github.com/atom-minimap/minimap/issues/344))
- Add support for incoming display layer feature in Atom ([ae7b9bc8](https://github.com/atom-minimap/minimap/commit/ae7b9bc88eb1785a564181eafa46f361244d979c), [#474](https://github.com/atom-minimap/minimap/pull/474))

<a name="v4.22.1"></a>
# v4.22.1 (2016-04-16)

## :bug: Bug Fixes

- Fix requesting a repaint when the minimap is not attached yet ([07dbde8c](https://github.com/atom-minimap/minimap/commit/07dbde8c83163f6cc0e1f5af99ac292792a7c5f3))

<a name="v4.22.0"></a>
# v4.22.0 (2016-04-16)

## :sparkles: Features

- Add ignore whitespaces in tokens setting ([68c9826e](https://github.com/atom-minimap/minimap/commit/68c9826e92ddca6f35600a4f12aa1a56c30b1aaf), [#465](https://github.com/atom-minimap/minimap/issues/465))
- Add a gutter decoration type ([5ac833ed](https://github.com/atom-minimap/minimap/commit/5ac833ed1f9b02fff2cd51c376e2ceacd3aedd1f))

## :bug: Bug Fixes

- Fix minimap size in absolute mode with adjustMinimapToSoftWrap enabled ([c7fb8acc](https://github.com/atom-minimap/minimap/commit/c7fb8acc62c306ca6841e7fdb311d6b81555874c))


<a name="v4.21.0"></a>
# v4.21.0 (2016-03-14)

## :sparkles: Features

- Implement asynchronous animated scrolling ([7477ed0b](https://github.com/atom-minimap/minimap/commit/7477ed0bf62069eeab37f85517b33c260e31e2bd))  <br>When both `scrollAnimation` and `independentMinimapScroll` settings are
  enabled, the animation of the minimap no longer follow the animation of
  the editor, preventing the minimap from jumping to the starting editor
  scroll before moving towards the end scrolling position.
- Add new custom decorations type. [See the decoration types documentation](https://github.com/atom-minimap/minimap/blob/master/docs/Developers%20Documentation.md#decorations-types) for details.

## :bug: Bug Fixes

- Fix plugin activation when displayPluginControls is disabled ([966eb298](https://github.com/atom-minimap/minimap/commit/966eb2986c85ba2caaa52718aa2a092d55cbf431), [#458](https://github.com/atom-minimap/minimap/issues/458))

<a name="v4.20.0"></a>
# v4.20.0 (2016-03-06)

## :sparkles: Features

- Add independent scrolling setting when mouse wheeling over the minimap ([376b0b72](https://github.com/atom-minimap/minimap/commit/376b0b7230974aadb73d6609ee35c7897d13ce27), [#414](https://github.com/atom-minimap/minimap/issues/414))<br>This allow to browse a file quickly and pinpoint a location to jump to from the minimap.
- Implement media query listener for device pixel ratio changes ([54780a4f](https://github.com/atom-minimap/minimap/commit/54780a4f52e16ed1e076bc162f224ac5d8e5cc8a))
  <br>It should help in [#450](https://github.com/atom-minimap/minimap/issues/450) case.
- Implement sorted decorations rendering ([8ad6a66f](https://github.com/atom-minimap/minimap/commit/8ad6a66f6d57030807ae9e1d163bfea70398c1ab), [#453](https://github.com/atom-minimap/minimap/issues/453))
- Add a decoration order setting for each registered plugin ([b912132a](https://github.com/atom-minimap/minimap/commit/b912132a4ed6d11ba635e78740356c0314bcac22))
- Add support for scoped settings for both editor and minimap settings ([92a3c663](https://github.com/atom-minimap/minimap/commit/92a3c663962b3fa0484a635da109828c235ee3ad), [#456](https://github.com/atom-minimap/minimap/issues/456))

## :bug: Bug Fixes

- Fix incorrect value for display style ([b58d35ae](https://github.com/atom-minimap/minimap/commit/b58d35aea91796d699451a295b583eab117163e2))

<a name="v4.19.0"></a>
# v4.19.0 (2015-12-24)

## :sparkles: Features

- Add a smoothScrolling setting to enable/disable canvas offset ([18f57c80](https://github.com/atom-minimap/minimap/commit/18f57c80fd248e4e888e87da692bb71bb8109689))

<a name="v4.18.4"></a>
# v4.18.4 (2015-12-21)

## :bug: Bug Fixes

- Fix error raised when editor is destroyed during animation ([cb215b68](https://github.com/atom-minimap/minimap/commit/cb215b68427264586fd8b56874e7d8e8a71853ae), [#438](https://github.com/atom-minimap/minimap/issues/438))

<a name="v4.18.3"></a>
# v4.18.3 (2015-12-21)

## :bug: Bug Fixes

- Fixes [#383](https://github.com/atom-minimap/minimap/issues/383) Fix touch scroll support ([cfb509eb](https://github.com/atom-minimap/minimap/commit/cfb509ebe1b861be4ee0c0d85227ba00144234bf), thanks to @TimoSta)

<a name="v4.18.2"></a>
# v4.18.2 (2015-12-17)

## :racehorse: Performances

- Lazy load model and views ([e0b11276](https://github.com/atom-minimap/minimap/commit/e0b11276ebd2d28581f85114e40d8d59590b84ca), [#430](https://github.com/atom-minimap/minimap/issues/430))

<a name="v4.18.1"></a>
# v4.18.1 (2015-12-16)

## :bug: Bug Fixes

- Clear require cache on main module loading ([1b698abf](https://github.com/atom-minimap/minimap/commit/1b698abf8da2e07408e67be8a27c53c96dbf4188))
- Fix folding/unfolding rows giving invalid redraw range ([8d0f061c](https://github.com/atom-minimap/minimap/commit/8d0f061c8ef3e7780d714a86a7451b4cdd7cdee6), [#429](https://github.com/atom-minimap/minimap/issues/429))

## :racehorse: Performances

- Use dedicated pending changes array for back and front decorations ([aef0c49a](https://github.com/atom-minimap/minimap/commit/aef0c49a1544023e189fee17b5d45c02fbc189eb))

<a name="v4.18.0"></a>
# v4.18.0 (2015-12-11)

## :racehorse: Performances

- Add a CanvasLayer class to handle onscreen/offscreen canvases ([b339e73e](https://github.com/atom-minimap/minimap/commit/b339e73ebbae0a93279bd002d046b069578cf282))<br/>
  Render is now separate into three layers to reduce accesses to line tokens.

## :bug: Bug Fixes

- Fix over-blurring of the Minimap for device with a float for pixel raio ([77f3b38f9](https://github.com/atom-minimap/minimap/commit/77f3b38f99f3a3998ea3ef6d3a72d38e2186caf5))


## :arrow_up: Dependencies Update

- Bump atom-utils version ([d42fe50d](https://github.com/atom-minimap/minimap/commit/d42fe50d083ba4212f2f5295f01b34a910de1560))

<a name="v4.17.0"></a>
# v4.17.0 (2015-12-08)

:sparkles: **Starting with this version, the Minimap is now totally written in ES6 with Babel** :sparkles:

We're also using the decorator feature from ES7 for mixin inclusion and custom elements registration.

## :sparkles: Features

- Add a element decorator to handle creating custom elements ([f1823116](https://github.com/atom-minimap/minimap/commit/f18231168b8b63298390d1e4000577e329aa18b4))
- Add a helper function to generate decorators for mixin inclusion ([d2ed7591](https://github.com/atom-minimap/minimap/commit/d2ed759189fa43ece70cc96f6f2d1bde8fe6a8d8))
- Add new dependency to support ES7 features linter and docs ([dc758103](https://github.com/atom-minimap/minimap/commit/dc75810314e153f992b7fd1a38863bde7ee67893))
- Add esdoc to generate documentation for es6 version ([68142570](https://github.com/atom-minimap/minimap/commit/681425707d7398f979ba988f605a1030ed6a04dd))
- Add standard linter for es6 conversion ([f0bb6561](https://github.com/atom-minimap/minimap/commit/f0bb6561cdafa2f4447a558b673787bf0c91f552))
- Use new Babel-friendly space-pen DSL ([e4be4483](https://github.com/atom-minimap/minimap/commit/e4be4483b2d7b9d0ef99d955052c357f4efaec69))

## :racehorse: Performances

- Avoid reading directly from the line's token property ([e8235235](https://github.com/atom-minimap/minimap/commit/e823523526a3502dc8e781bf67a8bebd1a51f1d1))

## :arrow_up: Dependencies Update

- Bump atom-utils version ([b15fce7a](https://github.com/atom-minimap/minimap/commit/b15fce7a7f106d70c316721e06f21bb5eb56fe9b))

<a name="v4.16.2"></a>
# v4.16.2 (2015-11-24)

## :bug: Bug Fixes

- Prevent stand alone minimap to have width, height and flex properties ([fd7a9dd0](https://github.com/atom-minimap/minimap/commit/fd7a9dd003aa0c113ee0bc84165da49449c0dcb1))
- Prevent generation of a returned array in drawLineDecorations method ([04fdd35c](https://github.com/atom-minimap/minimap/commit/04fdd35c01752ac0b1a13b280f2880ed72f8c14f))

<a name="v4.16.1"></a>
# v4.16.1 (2015-11-18)

## :bug: Bug Fixes

- Store minimap locally in update to prevent racing conditions ([8a7179f3](https://github.com/atom-minimap/minimap/commit/8a7179f3949c3eb57dc38f4978eb3a1557813121))

## :racehorse: Performances

- Implement a basic cache of editor dimension during update ([5aeb5ce3](https://github.com/atom-minimap/minimap/commit/5aeb5ce3905d51fa70862720ec0acd191d06f719))

<a name="v4.16.0"></a>
# v4.16.0 (2015-11-01)

## :sparkles: Features

- Implement new custom elements registration to allow updates ([f5ab5e36](https://github.com/atom-minimap/minimap/commit/f5ab5e36b85cb39b43c9f4f66737f3aacdddebbc))
- Implement removing unused elements in stand-alone minimap ([72e7a90e](https://github.com/atom-minimap/minimap/commit/72e7a90e9ec18b78acc7a5ca96ac27298008b4e1))
- Add custom render settings on a per-minimal basis ([4eed31af](https://github.com/atom-minimap/minimap/commit/4eed31afd1908c1b4a4ed0a3f42ef5b5165c9db7))

## :arrow_up: Dependencies Update

- Bump atom-utils version ([b4fc2d94](https://github.com/atom-minimap/minimap/commit/b4fc2d94ed6bdeedf8cb53068a7e8b716c3c6b84))

<a name="v4.15.2"></a>
# v4.15.2 (2015-10-31)

## :bug: Bug Fixes

- Fix minimap broken with changes in flex box behaviour ([0c9389d8](https://github.com/atom-minimap/minimap/commit/0c9389d8141de337dec32724f85ec9d58271124d))
- Fix deprecations in tests ([3bb81d39](https://github.com/atom-minimap/minimap/commit/3bb81d39261271347dfb4bd58873879b0262659d))

<a name="v4.15.1"></a>
# v4.15.1 (2015-10-30)

## :bug: Bug Fixes

- Fix unusual issue if an invisible char is not a string ([f261d5ad](https://github.com/atom-minimap/minimap/commit/f261d5ad3396455d4c0beb1ce4f98520c51cb9a5), [#397](https://github.com/atom-minimap/minimap/issues/397))

<a name="v4.15.0"></a>
# v4.15.0 (2015-10-22)

## :sparkles: Features

- Implement a new adapter layer to handle differences between stable and beta ([0d93666e](https://github.com/atom-minimap/minimap/commit/0d93666eea59159047459d246d815b3eb501633d))


<a name="v4.14.0"></a>
# v4.14.0 (2015-10-17)

## :bug: Bug Fixes

- Fix all remaining depracations in specs and element ([a0e418d9](https://github.com/atom-minimap/minimap/commit/a0e418d967ae6d03a8599e570af4195cdcb69eb9))
- Fix access to private API removed in latest master ([cf37f604](https://github.com/atom-minimap/minimap/commit/cf37f6041c2fb2a303ed43ec426223c2bb2a22a2), [#387](https://github.com/atom-minimap/minimap/issues/387))

## :arrow_up: Dependencies Update

- Bump minimum engine version ([a705ac6c](https://github.com/atom-minimap/minimap/commit/a705ac6cf32829b11c48145085d3396f010dee44))

<a name="v4.13.4"></a>
# v4.13.4 (2015-09-25)

## :bug: Bug Fixes

- Use provided text editor ([e2883013](https://github.com/atom-minimap/minimap/commit/e2883013edf707205a94b7aabf3f063f7ae42149))

<a name="4.13.3"></a>
# 4.13.3 (2015-09-08)

## :bug: Bug Fixes

- Use cache when reading DOM for color when highlighting is disabled ([b9ae0f54](https://github.com/atom-minimap/minimap/commit/b9ae0f54f571d025eaefdf99ce94bdc66ebc89c1), [#384](https://github.com/atom-minimap/minimap/issues/384))

<a name="v4.13.2"></a>
# v4.13.2 (2015-08-27)

## :bug: Bug Fixes

- Prevent any measuring when there's no minimap model ([892b7aaa](https://github.com/atom-minimap/minimap/commit/892b7aaadd51f28db166e376795d08fa568d1919), [#376](https://github.com/atom-minimap/minimap/issues/376))

<a name="v4.13.1"></a>
# v4.13.1 (2015-08-20)

## :bug: Bug Fixes

- Prevent setting size of an undefined model ([a3ce4127](https://github.com/atom-minimap/minimap/commit/a3ce4127efd11d0d114e3edf782edc8307c3564b), [#373](https://github.com/atom-minimap/minimap/issues/373))

<a name="v4.13.0"></a>
# v4.13.0 (2015-08-19)

## :sparkles: Features

- Add a `setStandAlone` method on minimaps and dispatch a dedicated event on change ([1e3e5f7b](https://github.com/atom-minimap/minimap/commit/1e3e5f7babc82574e3181d21e7aa0ef0e5376fb5))
- Implement independent scroll top for stand-alone minimap ([6afdac4c](https://github.com/atom-minimap/minimap/commit/6afdac4c519096aa98548ec301c453e6eb1d8991))
- Add `standAloneMinimapForEditor` method in API ([8970216c](https://github.com/atom-minimap/minimap/commit/8970216cb046360d3cfa54aabcb1608964a667da))
- Add stand-alone mode in minimap ([5560408e](https://github.com/atom-minimap/minimap/commit/5560408ed1a9e40caaade197ea6abbcbf2da6b7e))  <br>In stand-alone mode the minimap can operate using a fixed width and height.
- Add a flag in minimap element to know whether it has been attached to a text editor or not ([5f37e22c](https://github.com/atom-minimap/minimap/commit/5f37e22cc5ed9527689fa832a667fed59ffe2fb3))

<a name="v4.12.3"></a>
# v4.12.3 (2015-08-12)

## :racehorse: Performances

- Speed up scrolling with lots of decorations ([7b495e9f](https://github.com/atom-minimap/minimap/commit/7b495e9f259d02aa02bb7c223a33138cc8c0f8cc))

<a name="v4.12.2"></a>
# v4.12.2 (2015-08-03)

## :bug: Bug Fixes

- Fix visibility changes not properly watched when a tab become active ([806dd4bd](https://github.com/atom-minimap/minimap/commit/806dd4bd1bc0769ed78d19e303d1476b04e8ae0b))

<a name="v4.12.1"></a>
# v4.12.1 (2015-07-27)

## :bug: Bug Fixes

- Fix error raised if some invisibles are undefined ([ee633703](https://github.com/atom-minimap/minimap/commit/ee6337034aae1c5b1330e553227b7d8e39410fc5), [#368](https://github.com/atom-minimap/minimap/issues/368))

<a name="v4.12.0"></a>
# v4.12.0 (2015-07-16)

## :sparkles: Features

- Add support for touch events for visible area dragging ([a6e0a8a1](https://github.com/atom-minimap/minimap/commit/a6e0a8a1838bffd675d7f249cc1e270b7400c09f), [#362](https://github.com/atom-minimap/minimap/issues/362))

<a name="v4.11.2"></a>
# v4.11.2 (2015-07-10)

## :bug: Bug Fixes

- Fix minimap position relying upon node order ([89c3b035](https://github.com/atom-minimap/minimap/commit/89c3b035419a119bd00cc5dcded2b2064589a377), [#358](https://github.com/atom-minimap/minimap/issues/358))

<a name="v4.11.1"></a>
# v4.11.1 (2015-07-09)

## :bug: Bug Fixes

- Fix leak minimap ([7b3c65ba](https://github.com/atom-minimap/minimap/commit/7b3c65bac13c93474b934de10f542a5e64fe092f))

<a name="v4.11.0"></a>
# v4.11.0 (2015-07-08)

## :sparkles: Features

- Add plugins templates for vanilla javascript and babel ([3511ef2b](https://github.com/atom-minimap/minimap/commit/3511ef2b55b323675e2ca1807cfd652f1f67fb17))

## :bug: Bug Fixes

- Fix quick settings button partially hidden by scrollbar in absolute mode ([a41f5d61](https://github.com/atom-minimap/minimap/commit/a41f5d61947ad02664d53882df70724a8236ce90), [#345](https://github.com/atom-minimap/minimap/issues/345))


<a name="v4.10.2"></a>
# v4.10.2 (2015-07-02)

## :bug: Bug Fixes

- Use owned version of the Decoration class ([a20dde78](https://github.com/atom-minimap/minimap/commit/a20dde7841987e0cf17270f2eed3145592e0f05a), [#357](https://github.com/atom-minimap/minimap/issues/357))

<a name="v4.10.1"></a>
# v4.10.1 (2015-06-29)

## :bug: Bug Fixes

- Fix invalid intact ranges computed when added a decoration ([178dca41](https://github.com/atom-minimap/minimap/commit/178dca41b271455976ce72c22af11df05cf3215a))

## :racehorse: Performances

- Speed up updates due to decoration's marker changes ([42307e7d](https://github.com/atom-minimap/minimap/commit/42307e7d22ef1988086bb500cd3e7343258987f7))

## :arrow_up: Dependencies Update

- Bump minimum Atom version ([efd6dc5f](https://github.com/atom-minimap/minimap/commit/efd6dc5f57980d838ed204a2f97118ee9d52c2b6))

<a name="v4.10.0"></a>
# v4.10.0 (2015-06-10)

## :sparkles: Features

- Add control over absolute mode in the quick settings popup ([1ae73d91](https://github.com/atom-minimap/minimap/commit/1ae73d910cfb88ee01f02019816029eaf2cd2738))
- Add an absolute mode setting allowing the text editor content to flow below the minimap ([2fa132f8](https://github.com/atom-minimap/minimap/commit/2fa132f8dec320759292f4cb69296d931497648a), [#337](https://github.com/atom-minimap/minimap/issues/337))

## :bug: Bug Fixes

- Fix reading tokens from undefined lines ([a5bcc7a2](https://github.com/atom-minimap/minimap/commit/a5bcc7a24bb07f96a8899b4d15f7eb724c0b4d4c), [#341](https://github.com/atom-minimap/minimap/issues/341))

<a name="v4.9.4"></a>
# v4.9.4 (2015-06-05)

## :bug: Bug Fixes

- Fix error raised when creating a decoration ([6992530d](https://github.com/atom-minimap/minimap/commit/6992530d23fb84525808c1a02e1911dea93a4d52), [#335](https://github.com/atom-minimap/minimap/issues/335))

<a name="v4.9.3"></a>
# v4.9.3 (2015-06-04)

## :bug: Bug Fixes

- Fix duplicated lines at the end of the minimap ([e048e168](https://github.com/atom-minimap/minimap/commit/e048e1682b71d95e5c40ffb9250f1e0aedd1b36b), [#292](https://github.com/atom-minimap/minimap/issues/292))

<a name="v0.9.2"></a>
# v0.9.2 (2015-06-01)

## :bug: Bug Fixes

- Fix typo in method name ([da9dec45](https://github.com/atom-minimap/minimap/commit/da9dec4513d30ed4187fb1944c5abeb403b30b4b))

<a name="v4.9.1"></a>
# v4.9.1 (2015-06-01)

## :bug: Bug Fixes

- Fix hue-rotate filter not accounted when computing a token color ([53fa7062](https://github.com/atom-minimap/minimap/commit/53fa70628478f04e2e72aaa8bfa6627863114f9c), [#330](https://github.com/atom-minimap/minimap/issues/330))

<a name="v4.9.0"></a>
# v4.9.0 (2015-05-18)

## :sparkles: Features

- Add context menu to toggle the minimap ([edcb74bc](https://github.com/atom-minimap/minimap/commit/edcb74bcbe4fd6cabcddbe279b2c982acb556cb8), [#326](https://github.com/atom-minimap/minimap/issues/326))
- Add minimap-autohide to the list of plugins ([e17588ac](https://github.com/atom-minimap/minimap/commit/e17588acd93a8fd9471e0640db0be2b01b6de325))

<a name="v4.8.0"></a>
# v4.8.0 (2015-04-30)

## :sparkles: Features

- Implemented middle click click-and-drag behavior. Resolves #290 ([86c155b7](https://github.com/atom-minimap/minimap/commit/86c155b7996193b52c263f155921b3cb76ac13e0))
- Implemented middle click to jump-to-location ([175d058e](https://github.com/atom-minimap/minimap/commit/175d058ee39e8383c42cbf243f78511f5bd8dbc7))

## :bug: Bug Fixes

- Fix typo ([daeb0834](https://github.com/atom-minimap/minimap/commit/daeb083452bc0267082a5c11e8552369dd3ccc19))

<a name="v4.7.6"></a>
# v4.7.6 (2015-04-08)

## :bug: Bug Fixes

- Fix misplacement of the quick settings view in one-dark-ui ([40e6f05a](https://github.com/atom-minimap/minimap/commit/40e6f05ae44ed536fb8c0a63de9cb85f8dea6b79))
- Fix visible area spreading outside minimap in one-dark-ui ([12aadd2c](https://github.com/atom-minimap/minimap/commit/12aadd2cd227b7ffe36401ff7a2530f25c59c64e))

<a name="v4.7.5"></a>
# v4.7.5 (2015-04-02)

## :bug: Bug Fixes

- Fix DOM polling requesting an update on every call ([075d1a60](https://github.com/atom-minimap/minimap/commit/075d1a60987855bcfb9c43df8f24edc14e7b6c58))

## :racehorse: Performances

- Register to styles changes only after being attached ([f466703c](https://github.com/atom-minimap/minimap/commit/f466703c100800a11310db289693bc0ef0f138dc))

<a name="v4.7.4"></a>
# v4.7.4 (2015-04-02)

## :racehorse: Performances

- Remove line causing method deoptimization ([2f945585](https://github.com/atom-minimap/minimap/commit/2f9455857bf329504f452321b20a62cc83cad686))

<a name="v4.7.3"></a>
# v4.7.3 (2015-04-02)

## :bug: Bug Fixes

- Fix unescaped invisibles regexp breaking render ([882ed5d7](https://github.com/atom-minimap/minimap/commit/882ed5d75d46532d676fb0276c33e131beda4771), [#308](https://github.com/atom-minimap/minimap/issues/308))

<a name="v4.7.2"></a>
# v4.7.2 (2015-04-02)

- Improve cursor style when dragging the minimap visible area ([b66ab37f](https://github.com/atom-minimap/minimap/commit/b66ab37f199fbd8f7abf188bdeebb824c405bd70), [#307](https://github.com/atom-minimap/minimap/issues/307))

<a name="v4.7.1"></a>
# v4.7.1 (2015-03-31)

## :bug: Bug Fixes

- Fix minimap dragging stopped at the end of the canvas ([d4c02dfb](https://github.com/atom-minimap/minimap/commit/d4c02dfb73cda0b852f25720776bb151802407ee), [#306](https://github.com/atom-minimap/minimap/issues/306))

<a name="v4.7.0"></a>
# v4.7.0 (2015-03-30)

## :bug: Bug Fixes

- Fix not update when user-styles reload, ([af961750](https://github.com/atom-minimap/minimap/commit/af9617505fe4b217b34dc2ce1c0bd3f01fc34b73), [#303](https://github.com/atom-minimap/minimap/issues/303))

<a name="v4.6.0"></a>
# v4.6.0 (2015-03-11)

## :sparkles: Features

- Add a setting for scroll animation duration ([32663de0](https://github.com/atom-minimap/minimap/commit/32663de09c39353c40b4a20fbbf5d41311968591))  <br>Useful in test so that we can override it. Also if people want to tweak
  it, it’s now possible.

## :bug: Bug Fixes

- Fix missing forced update when minimap become visible again ([8ed9aae0](https://github.com/atom-minimap/minimap/commit/8ed9aae0ee5e0dfc5aebb506b1de75b2a11a5123))

<a name="v4.5.0"></a>
# v4.5.0 (2015-03-03)

## :sparkles: Features

- Add a highlight-outline decoration mode ([45bf0f44](https://github.com/atom-minimap/minimap/commit/45bf0f44ae9c8b6d7a0036f2e1ad971ac2c639f7))
  <br>It works like a highlight but only render the outline

## :bug: Bug Fixes

- Fix plugin generation view ([30bea55c](https://github.com/atom-minimap/minimap/commit/30bea55c9ce8c408c1165ca3922c6e77c4b8ea4b))

<a name="v4.4.0"></a>
# v4.4.0 (2015-03-01)

## :sparkles: Features

- Plugins can now use the `minimap` service provider to access the minimap package.

## :racehorse: Performances

- Speed up decorations retrieval when rendering lines ([ad4b33b6](https://github.com/atom-minimap/minimap/commit/ad4b33b65f6f057c58e14073f0971a1bfd857792))

## :arrow_up: Dependencies Update

- Update engine version ([53457ffb](https://github.com/atom-minimap/minimap/commit/53457ffbf2c34c57d4a09f91d73d691b24189088))

<a name="v4.3.1"></a>
# v4.3.1 (2015-02-22)

## :bug: Bug Fixes

- Fix QuickSettings is overlapped by editor scrollbar ([47249678](https://github.com/atom-minimap/minimap/commit/4724967818ceb479db164d16ae6fc23974d042e6), [#279](https://github.com/atom-minimap/minimap/issues/279))

<a name="v4.3.0"></a>
# v4.3.0 (2015-02-20)

- :stars: Transfer to Atom-Minimap
- plugins list screen cap ([5595ab36](https://github.com/atom-minimap/minimap/commit/5595ab36e591e7fd7d7a61142254303c69a7e8d8))

<a name="v4.2.3"></a>
# v4.2.3 (2015-02-19)

## :bug: Bug Fixes

- Fix error raised when opening Atom with no buffer opened ([c186e618](https://github.com/atom-minimap/minimap/commit/c186e618e5ae8b7ac8dfe42aaad0a8080417767b), [#276](https://github.com/atom-minimap/minimap/issues/276))

<a name="v4.2.2"></a>
# v4.2.2 (2015-02-16)

## :bug: Bug Fixes

- Fix size settings not allowing float numbers [9a9df90e](https://github.com/atom-minimap/minimap/commit/9a9df90e1c2dca1232e62c6ea720407823d857e6, [#271](https://github.com/atom-minimap/minimap/issues/271))

<a name="v4.2.1"></a>
# v4.2.1 (2015-02-16)

## :bug: Bug Fixes

- Fix error raised on destruction due to remaining decorations ([23f13497](https://github.com/atom-minimap/minimap/commit/23f134978d4e8700761a05440c971cb20dd76e13), [#273](https://github.com/atom-minimap/minimap/issues/273))

<a name="v4.2.0"></a>
# v4.2.0 (2015-02-16)

## :sparkles: Features

- Add keyboard controls for minimap position ([a741d926](https://github.com/atom-minimap/minimap/commit/a741d926706a79372a4cefa147157eec2b9265e2))
- Add controls to toggle the position of the minimap ([6434c34b](https://github.com/atom-minimap/minimap/commit/6434c34bb9733312e0676b5a55cbacbf43838886))

## :bug: Bug Fixes

- Fix open-minimap-quick-settings and minimap-scroll-indicator's position on HiDPI displays ([7909b5c7](https://github.com/atom-minimap/minimap/commit/7909b5c72f01bc9c4be48530aa3e5286c1713224))
- Fix code highlight not toggled with keyboard in quick settings ([f0fbe442](https://github.com/atom-minimap/minimap/commit/f0fbe44250cb0c106e106f360db171f77912f8e4))
- Fix quick settings position with soft wrap and on left settings ([61495669](https://github.com/atom-minimap/minimap/commit/61495669a2ea3c869453c08f5f9f7e520da667fe))
- Fix position of the quick settings view when minimap is on left ([0d454456](https://github.com/atom-minimap/minimap/commit/0d454456a72b44fa2cfc54d96469341719983a09))

## :arrow_up: Dependencies Update

- update semver ([4e30323b](https://github.com/atom-minimap/minimap/commit/4e30323b3e24213ae533df4e3cd09f889528b264))

<a name="v4.1.4"></a>
# v4.1.4 (2015-02-10)

## :sparkles: Features

- Add softWrapAtPreferredLineLength test case ([9ca75aca](https://github.com/atom-minimap/minimap/commit/9ca75acaa891cba13737c1a06ddfa6d0102b2052))

## :bug: Bug Fixes

- Fix getTextEditorScrollRatio() return NaN, #260 ([2d656596](https://github.com/atom-minimap/minimap/commit/2d656596f8d29d5c10c231d36a1906dd2ce5550d))
- Fix travis build-package script ([00cf91de](https://github.com/atom-minimap/minimap/commit/00cf91de819b34c447e269922c8c86671af565e5))

<a name="v4.1.3"></a>
# v4.1.3 (2015-02-08)

## :bug: Bug Fixes

- Fix minimap width when enable soft wrap and at preferred line length(\>=16384). ([#256](https://github.com/atom-minimap/minimap/issues/256))

<a name="v4.1.2"></a>
# v4.1.2 (2015-02-07)

## :bug: Bug Fixes

- minimap should be not toggle when minimap was disabled

<a name="v4.1.1"></a>
# v4.1.1 (2015-02-07)

## :bug: Bug Fixes

- Fix broken toggling when it is toggled, disabled, enabled ([e4bce068](https://github.com/atom-minimap/minimap/commit/e4bce0689894107d28921e99ebc390c7eac5402e), [#255](https://github.com/atom-minimap/minimap/issues/255))

<a name="v4.1.0"></a>
# v4.1.0 (2015-02-04)

## :sparkles: Features

- Add scroll animation. ([986c725e](https://github.com/atom-minimap/minimap/commit/986c725e232b4825f8700fe8e0008f10e095e89e))

## :bug: Bug Fixes

- Fix missing DOM cache invalidation when themes are changed ([333c1558](https://github.com/atom-minimap/minimap/commit/333c15583f3cdd4c17cb396b3ec46e00f07ca46f), [#250](https://github.com/atom-minimap/minimap/issues/250))

<a name="v4.0.2"></a>
# v4.0.2 (2015-02-03)

## :bug: Bug Fixes

- Fix minimap instanciated before having required Minimap ([ca01a307](https://github.com/atom-minimap/minimap/commit/ca01a307529e49920fb9a88cd81457063993bf94), [#212](https://github.com/atom-minimap/minimap/issues/212))
- Fix deprecation in plugin generator command ([cbe85b8c](https://github.com/atom-minimap/minimap/commit/cbe85b8c3ee34e218de83abe60e0bdecb3f7c2c5))

<a name="v4.0.1"></a>
# v4.0.1 (2015-02-03)

## :bug: Bug Fixes

- Fix error raised when retrieving active minimap without active editor ([549830d8](https://github.com/atom-minimap/minimap/commit/549830d89d2bb7e6622bf0244e6996c1507676fa))


<a name="v4.0.0"></a>
# v4.0.0 (2015-02-03)

## :bug: Bug Fixes

- Fix right click starting a drag gesture ([c17a5dc9](https://github.com/atom-minimap/minimap/commit/c17a5dc9292aac177e9f14f9d26c53f64dcfc5d8))
- Fix controls and scroll indicator position ([2ffa507c](https://github.com/atom-minimap/minimap/commit/2ffa507c091fa2578d60e270df2ba34ec3c68dc8))
- Fix minimap size when splitting a pane ([bbe60ddb](https://github.com/atom-minimap/minimap/commit/bbe60ddb36bc21349c606bfebe58f8a06160bb78))
- Fix missing minimap when a plugin get an instance before the observer ([98729736](https://github.com/atom-minimap/minimap/commit/987297363ad34b58404ffbe2a8bafebfb5a45b97))
- Fix removed commands in activate ([412b083f](https://github.com/atom-minimap/minimap/commit/412b083f19b22e3fd30768d4fd11c0d6a42fa1ba))
- Fix plugin template for v4 ([ce09615f](https://github.com/atom-minimap/minimap/commit/ce09615f242610f5c8859eabbd348edde18ed503))
- Fix styles directory deprecation ([ff047197](https://github.com/atom-minimap/minimap/commit/ff04719765061fe710007be682e1f609cb6e3833))
- Fix deprecation on theme observer ([d1d183a5](https://github.com/atom-minimap/minimap/commit/d1d183a5d58e17bb30dd76243fd76f8b4ad860fc))

<a name="v3.5.6"></a>
# v3.5.6 (2015-01-16)

## :bug: Bug Fixes

- Fix deprecations in stylesheet ([393ef8c0](https://github.com/atom-minimap/minimap/commit/393ef8c04caa9c8ace99e1626933ede3a43c8593))

<a name="v3.5.5"></a>
# v3.5.5 (2015-01-14)

## :bug: Bug Fixes

- Prevent text selection of the minimap ([#219](https://github.com/atom-minimap/minimap/pull/219)).

<a name="v3.5.4"></a>
# v3.5.4 (2015-01-07)

## :bug: Bug Fixes

- Fix error raised when clicking on minimap ([a77a94a9](https://github.com/atom-minimap/minimap/commit/a77a94a981128a5a2f1335bc02729d510dfd8310), [#198](https://github.com/atom-minimap/minimap/issues/198))
- Add guard when screenDelta is NaN ([4f1f204c](https://github.com/atom-minimap/minimap/commit/4f1f204c6b18380e5286e0e680289d62177bfd22))
- Fix screen delta not set in decoration changes ([3aa521bd](https://github.com/atom-minimap/minimap/commit/3aa521bdefab1d5c0f27169e106a2e40dca53b6a))

<a name="v3.5.3"></a>
# v3.5.3 (2015-01-07)

## :bug: Bug Fixes

- Fix broken access to minimap for editor when editor is undefined ([3127b25b](https://github.com/atom-minimap/minimap/commit/3127b25bb3d845825a3ec477da1942215f630df1), [#200](https://github.com/atom-minimap/minimap/issues/200))

<a name="v3.5.2"></a>
# v3.5.2 (2015-01-07)

## :bug: Bug Fixes

- Fix broken quick settings command in v3 mode ([8cbde1df](https://github.com/atom-minimap/minimap/commit/8cbde1dfd4a6418335ea6f5235cbbd6b627ef16b), [#194](https://github.com/atom-minimap/minimap/issues/194))

<a name="v3.5.1"></a>
# v3.5.1 (2015-01-07)

## :bug: Bug Fixes

- Fix minimap position not updated if setting change before attachment ([4b9b6242](https://github.com/atom-minimap/minimap/commit/4b9b624243cd8102bc1bd4f4a19eab1d59247b5d))
- Prevent NaN screenDelta in changes ([4f00149e](https://github.com/atom-minimap/minimap/commit/4f00149e8d98a9affe6ca3488db33aa41d1b334a))
- Stop drag gesture when mouse leaves the window ([8d026d14](https://github.com/atom-minimap/minimap/commit/8d026d147e60cb142573ebee755e5ece5028d174), [#193](https://github.com/atom-minimap/minimap/issues/193))
- Fix minimap canvas scaling when device pixel ratio > 1 ([8c066eee](https://github.com/atom-minimap/minimap/commit/8c066eee35694320687b157de5fbb8bd3f3e447d), [#192](https://github.com/atom-minimap/minimap/issues/192))
- Fix duplicated minimap when dragging tab ([83830ca4](https://github.com/atom-minimap/minimap/commit/83830ca40b34fd7361c973a96619dfb20c0bf958))

<a name="v3.5.0"></a>
# v3.5.0 (2015-01-05)

The main change in v3.5.0 is the addition of the `V4 Preview` setting that enable the new custom element based minimap. **A Restart is needed to activate the preview. Plugins may be disabled if they doesn't have been updated to suport the new API.**

The following changes mostly concerns the implementation of the new minimap.

## :sparkles: Features

- Implement minimap creation observer method for v4 ([e583763a](https://github.com/atom-minimap/minimap/commit/e583763a8f166f42f177dcb7df9379827ee0ce28))
- Implement basic minimap scroll through dragging ([769fb815](https://github.com/atom-minimap/minimap/commit/769fb8153960baac29b4f1bc4ace419db852a14d))
- Implement scroll on mouse pressed over canvas ([eb927855](https://github.com/atom-minimap/minimap/commit/eb9278552561539ce9d1ac87f45b738f12d6f573))
- Implement sublime-like minimap scroll with scroll past end ([5d5185b7](https://github.com/atom-minimap/minimap/commit/5d5185b725ba399345cfba363b44b59825782e02))
  <br>It prevents the minimap from going past the end while the editor is.
- Implement code highlight toggle from quick settings in element ([c779f6fd](https://github.com/atom-minimap/minimap/commit/c779f6fd0eb3c7dac950d423fe95480f4b765a8c))
- Implement proper quick settings view life cycle ([9af0bd12](https://github.com/atom-minimap/minimap/commit/9af0bd12f6b9c6820c8b649f71517c4e6de79558))
- Add quick settings button in minimap element ([a2184d14](https://github.com/atom-minimap/minimap/commit/a2184d14b2b608c85a8ca7070e1c57fa1c2ea872))
- Implement minimap element destruction ([60081818](https://github.com/atom-minimap/minimap/commit/60081818e4a5af66e3245bbd3076b28b1d80a89c))
- Implement minimap model destruction ([b65698bb](https://github.com/atom-minimap/minimap/commit/b65698bb487c5d6a09cd95b263e861cef946ae04))
- Add support for adjustMinimapWidthToSoftWrap config ([b66bbbb1](https://github.com/atom-minimap/minimap/commit/b66bbbb1110b35988e60eff70ec89173307b8e7f))
- Implement a basic switch in main to enable v4 preview ([2d072921](https://github.com/atom-minimap/minimap/commit/2d072921d82006a1c75dcf65b5ff1c3447be5877))
- Implement config observers to update minimap elements ([5bea5458](https://github.com/atom-minimap/minimap/commit/5bea54580ba16270a671cba3688ae27526281be6))
- Implement minimap scroll indicator ([1128bb45](https://github.com/atom-minimap/minimap/commit/1128bb45241cf79e1b7688c65a4dd745bdf7ad61))
- Implement partial redraw on editor changes ([0c50eb55](https://github.com/atom-minimap/minimap/commit/0c50eb559070b0a2047b0ab32820ad6efd6b6b7a))
- Implement minimap on left config support in minimap element ([15a586a0](https://github.com/atom-minimap/minimap/commit/15a586a0cbb99ab70630820ad75084572cffb4ce))
- Implement resize detection with DOM polling ([a5b888ce](https://github.com/atom-minimap/minimap/commit/a5b888cece5f7570322ce7810deb5ab9cdf49e93))
- Implement canvas offset to allow smooth scroll ([57accd3c](https://github.com/atom-minimap/minimap/commit/57accd3c6e503c97eaa824cceb5f71db927442aa))
- Add support for visible area scroll in minimap element update ([f3b68565](https://github.com/atom-minimap/minimap/commit/f3b6856562918efa508505e99777117de2d5ae9b))
- Add support for editor left scroll in the minimap model ([d2f59e38](https://github.com/atom-minimap/minimap/commit/d2f59e38d85f15d1356df3675f2c1c4b466620e8))
- Add basic view update routine ([312b6080](https://github.com/atom-minimap/minimap/commit/312b60802372f17d83c147a954ac337f08a81ae2))
- Add basic content in minimap element ([8a8869d0](https://github.com/atom-minimap/minimap/commit/8a8869d07ae16d523ede73f512861b50d95438cf))
- Add view provider registration method on minimap element ([d1e95aa8](https://github.com/atom-minimap/minimap/commit/d1e95aa87161b0444179f04e7988f04d0899d314))
- Add stub for minimap element ([19f1aeaa](https://github.com/atom-minimap/minimap/commit/19f1aeaa99b19263b753c70031173afbf72ab40d))
- Implement decoration management in minimap model ([f6181c9d](https://github.com/atom-minimap/minimap/commit/f6181c9df4b60481d96ccd5a6f70752164cffc48))  <br>The biggest change so far is that changes are not stacked in the model
  but emitted as events.
- Add model method to compute the visible rows range ([5a38ef5c](https://github.com/atom-minimap/minimap/commit/5a38ef5c87d98ba02186714b8dfa8f047b9bb016))
- Add more minimap scroll related method ([990f29a1](https://github.com/atom-minimap/minimap/commit/990f29a100105c8949eb47a8478283794df7cd9a))
- Add more scroll related methods ([2e517425](https://github.com/atom-minimap/minimap/commit/2e517425bc086003f8c1fa94aa410764639fd99e))
- Add first methods in the new Minimap model ([93651f2a](https://github.com/atom-minimap/minimap/commit/93651f2a8259a68a971f1014180f3a66c19da1b3))

## :bug: Bug Fixes

- Fix missing getTextEditor method on minimap view ([569ee952](https://github.com/atom-minimap/minimap/commit/569ee952583a0b9cb116189c437f4279c92c61ab))
- Fix position of right positioned controls without using offset ([4f32ca74](https://github.com/atom-minimap/minimap/commit/4f32ca74fb0543033aa229aa4aaeab3b53df47f0))
- Change minimap width adjustments to avoid update on every DOM poll ([cca596c7](https://github.com/atom-minimap/minimap/commit/cca596c77c6eb647666a2a70646ba2c31c33da33))
- Prevent canvas resize when minimap become invisible ([43ebe7b9](https://github.com/atom-minimap/minimap/commit/43ebe7b94b41c79b5aad653b1d40691913a526e6))
- Fix minimap model not relying on screen lines ([3ea02bf5](https://github.com/atom-minimap/minimap/commit/3ea02bf51c80fe648eaaa2cc3c3e35968fe6928a))
- Fix minimap redraw when scrolling down ([d3edad15](https://github.com/atom-minimap/minimap/commit/d3edad1542195d3a627c2789107882ff39a10810))
- Bad value returned in getCharHeight ([6f804830](https://github.com/atom-minimap/minimap/commit/6f804830a98e39381656fd891ca26c9741342dbf))
- Fix missing method for decoration management in minimap ([b1911a9f](https://github.com/atom-minimap/minimap/commit/b1911a9f431dcc494d63e989fcf615a2efe4d0c9))
- Fix dom reader failing to append the node outside render view ([17ba1732](https://github.com/atom-minimap/minimap/commit/17ba1732194a47648adf9aa63a13591e064c0122))

## :racehorse: Performances

- Replace sequencial styles affectation with cssText ([f12ae20f](https://github.com/atom-minimap/minimap/commit/f12ae20f128a8dffa60438b3fa697936502c1d25))
- Use translate and translate3d for offsets ([98083d88](https://github.com/atom-minimap/minimap/commit/98083d884e9dcfc2c95625ed228c7b8bdce5761a))
- Prevent drawing tokens past the canvas width ([c7ab242f](https://github.com/atom-minimap/minimap/commit/c7ab242fc78c1be1adc911745c68cb1234211cbf))


<a name="v3.4.9"></a>
# v3.4.9 (2014-12-17)

## :bug: Bug Fixes

- Fix broken invisibles substitution when line is null ([c0c30ee9](https://github.com/atom-minimap/minimap/commit/c0c30ee9b2888c3b7a6f358208e8fd5d3212cb06), [#179](https://github.com/atom-minimap/minimap/issues/179))

<a name="v3.4.8"></a>
# v3.4.8 (2014-12-17)

## :bug: Bug Fixes

- Fix broken quick settings command ([bea14b44](https://github.com/atom-minimap/minimap/commit/bea14b44e78e079dc6813aec6e30e8c819419e4f), [#186](https://github.com/atom-minimap/minimap/issues/186))
- Fix minimum value for interline ([e4a114dc](https://github.com/atom-minimap/minimap/commit/e4a114dc99a65a003ebd4d5b4e2e3a6b0fee467d), [#175](https://github.com/atom-minimap/minimap/issues/175))

<a name="v3.4.7"></a>
# v3.4.7 (2014-12-10)

## :bug: Bug Fixes

- Fix broken scroll when clicking the minimap ([e9c501c9](https://github.com/atom-minimap/minimap/commit/e9c501c908b160cc4a86df9eebe911866fae6c0a), [#171](https://github.com/atom-minimap/minimap/issues/171))

<a name="v3.4.6"></a>
# v3.4.6 (2014-12-10)

## :bug: Bug Fixes

- :guardsman: Try to use the already retrieve pane when possible ([33dd8cf6](https://github.com/atom-minimap/minimap/commit/33dd8cf6bc3f9bf51d3a4cdc4b1c2dcd842a9001))
- Fix editor styles with minimap in zen mode ([6496aa92](https://github.com/atom-minimap/minimap/commit/6496aa92e05f96a5d45d0ec7d77888fd4d8cebed))

<a name="v3.4.5"></a>
# v3.4.5 (2014-12-05)

## :bug: Bug Fixes

- Fix broken view destruction with shadow DOM disabled ([7d062ec6](https://github.com/atom-minimap/minimap/commit/7d062ec601b0c63cedd2ef55f6990c96ab57f483), [#166](https://github.com/atom-minimap/minimap/issues/166))

<a name="v3.4.4"></a>
# v3.4.4 (2014-12-05)

## :bug: Bug Fixes

- Fix broken minimap when shadowRoot isn't enabled ([f5f6e779](https://github.com/atom-minimap/minimap/commit/f5f6e7792bd8ef471d2f122dabfc34e3f2adcb88))

<a name="v3.4.3"></a>
# v3.4.3 (2014-12-05)

## :bug: Bug Fixes

- Fix broken actions and navigation in quick settings ([b2114b34](https://github.com/atom-minimap/minimap/commit/b2114b348d0a66a077a27dd6ec7be121944efee6))

<a name="v3.4.2"></a>
# v3.4.2 (2014-12-05)

## :bug: Bug Fixes

- Should fix non-activation in post update hook ([659ffc63](https://github.com/atom-minimap/minimap/commit/659ffc63d7530ab340ca18054e22e708f1a9b1bf))

<a name="v3.4.1"></a>
# v3.4.1 (2014-12-05)

## :bug: Bug Fixes

- Fix atom-space-pen-views version in package.son ([90aa4588](https://github.com/atom-minimap/minimap/commit/90aa4588e8137a6f74d2883d1d10b73786b12fb4))

<a name="v3.4.0"></a>
# v3.4.0 (2014-12-05)

## :sparkles: Features

- Add an observeMinimaps method replacing eachMinimapView ([98c81307](https://github.com/atom-minimap/minimap/commit/98c8130705c6ffbf1ce4f0cf43f8654d5f5d7615))
- Add more defensive code if a marker can't be retrieved ([600e5bb1](https://github.com/atom-minimap/minimap/commit/600e5bb1ba3c855eac0312a9573d47b605b30ed5))
- Add defensive code on decorations methods ([6104fe17](https://github.com/atom-minimap/minimap/commit/6104fe17625e30af5d4f9d211d393167830f18aa))

## :bug: Bug Fixes

- Prevent removal of inexistant decorations ([a8e21c27](https://github.com/atom-minimap/minimap/commit/a8e21c277e308f6b1de44bac0da39ee4f04f0618))
- Fix broken quick settings button in minimap ([da1986a9](https://github.com/atom-minimap/minimap/commit/da1986a9510ca6410d60a7e8e5f8ff932ea2f47b))
- Fix missing decorations caused by shadow root ([f8b4ae03](https://github.com/atom-minimap/minimap/commit/f8b4ae03af85b0d4c3a10fc80490d4e11f447038))
- Fix bugs with minimap scrolling and height ([6327de96](https://github.com/atom-minimap/minimap/commit/6327de966f12a513641a59af3ac5f3321747c9c6))
- Fix retrieval of the dom colors ([b8c11bb3](https://github.com/atom-minimap/minimap/commit/b8c11bb31733d2bfbab4ed024769db4d6e1869f6))
- Fix last remaining deprecations ([0a6ea03e](https://github.com/atom-minimap/minimap/commit/0a6ea03ef278237216fe9ef66f68c0299d460e98))

## :racehorse: Performances

- Speed up rendering by sharing cache between instances ([6fd00fa6](https://github.com/atom-minimap/minimap/commit/6fd00fa6faa5dcf1d903ac663b8c7a00925391e8))

3.3.16 / 2014-12-01
===================

* fix code-highlights status in quick-settings menu

3.3.15 / 2014-11-30
===================

* fix error raised when trying to remove a decoration for a destroyed buffer

3.3.14 / 2014-11-25
===================

* fix minimap disappearing on tabs drag and drop

3.3.13 / 2014-11-20
===================

* fix minimap styles persisting after minimap deactivation
* remove key bindings for toggling command

3.3.12 / 2014-11-19
===================

* remove forgotten logging

3.3.11 / 2014-11-19
===================

* fix access to minimap view in quick settings

3.3.10 / 2014-11-18
===================

* fix minimap removed when the active item of a previous owner changed

3.3.9 / 2014-11-18
==================

* fix pane and editor styles when shadow dom is enabled

3.3.8 / 2014-11-14
==================

* exclude handling of text editor views that doesn't belong to a pane view

3.3.7 / 2014-11-12
==================

* fix links to documentation in Readme

3.3.6 / 2014-11-06
==================

* fix using `.editor` in tokens scopes breaks layout

3.3.5 / 2014-11-06
==================

* fix relying on overlayer to compute scroll offset

3.3.4 / 2014-10-22
==================

* fix access to deprecated scopes property of tokens

3.3.3 / 2014-10-13
==================

* fix invalid engine version since config changes

3.3.2 / 2014-10-10
==================

* fix minimap height not filling the whole editor height at startup

3.3.1 / 2014-10-10
==================

* fix duplication of minimap when dragging tabs between panes

3.3.0 / 2014-10-03
==================

* add option to set a max width to minimap when soft wrap is enabled

3.2.1 / 2014-10-02
==================

* fix invalid decoration change range registered when head and tail of a marker are inversed

3.2.0 / 2014-10-01
==================

* use new config schema
* fix bug with line decoration and retina display

3.1.4 / 2014-09-30
==================

* fix broken update on editor settings changes


3.1.3 / 2014-09-30
==================

* fix broken access to editor in getLinesCount when changing an editor setting

3.1.2 / 2014-09-29
==================

* fix render on retina display

3.1.1 / 2014-09-24
==================

* add config observers for editor settings that affect the minimap display
* fix various leak with config observers
* fix missing render view event dispatch on settings change

3.1.0 / 2014-09-22
==================

* add command to generate a plugin package
* fix remaining deprecated calls
* update documentation with old wiki pages
* set autoToggle true by default
* replace lineHeight by interline in settings

3.0.3 / 2014-09-19
==================

* fix issue with renamed event in Atom nightly

3.0.2 / 2014-09-19
==================

* fix the case where the minimap is positioned incorrectly when a user style alters the tab bar height

3.0.1 / 2014-09-19
==================

* fix bug with text drawing when charWidth != 1

3.0.0 / 2014-09-19
==================

* :racehorse: improved performances by switching to a canvas-based rendering
* :sparkles: add decoration API using the same interface than the Atom one
* implements a new event model based on the Atom one. Previous events re now deprecated.
* add new API documentation availaible at http://fangduncai.com/atom-minimap/

2.3.3 / 2014-08-27
==================

* handle properly the changes in the atom editors classes

2.3.2 / 2014-08-22
==================

* re-enable the minimap to work with legacy EditorView class

2.3.1 / 2014-08-19
==================

* fix a bug with removeAtKeyPath method in tests

2.3.0 / 2014-08-19
==================

* add a setting to completely turn off the plugin controls from the minimap settings.
* add a new entry in the quick settings dropdown to toggle the minimap highlights on a per-editor basis.


2.2.2 / 2014-08-17
==================

* fix a whitespace issue with Redacted font


2.2.1 / 2014-08-17
==================

* fix error raised when tokenized line doesn't have an `invisibles` property


2.2.0 / 2014-08-17
==================

* add option to toggle code highlights in the minimap

2.1.1 / 2014-08-17
==================

* fix minimap editor background hiding the underlayer

2.1.0 / 2014-08-17
==================

* add a quick access dropdown to toggle activation of minimap plugins

2.0.0 / 2014-08-16
==================

* remove the use of css scaling to render the minimap
* add new API allowing to replace an `EditorView` with a `MinimapView` for screen position computation in plugins that need to display markers over the minimap
* add click-then-drag support on the minimap *track*
* fix broken minimap in atom v0.123.0
* fix broken tests

1.6.0 / 2014-07-09
==================

* add a `Use Hardware Acceleration` option that allow to choose between `translate` or `translate3d` for the minimap scroll offset
* fix a weird rendering issue where many update of the minimap were done with various offset

1.5.2 / 2014-07-09
==================

* fix an unexpected offset on the right side of the editor contents

1.5.1 / 2014-07-09
==================

* fix with-minimap decoration removed on tab change when react editor is enabled
* fix pane styles with minimap and react editor enabled
* fix minimap line-height with react editor enabled
* fix error raised when closing the last tab in a pane

1.5.0 / 2014-07-07
==================

* add support for react editor mode

1.4.0 / 2014-06-28
==================

* fix error on line classlist access

1.3.0 / 2014-05-21
==================

* fix broken minimap when `useReactEditor` is enabled
* 🐎  remove forced hardware acceleration on minimap

1.2.0 / 2014-05-20
==================

* add a `Display Minimap On Left` setting allowing for the minimap to be placed on the left of the editor view
* add a line on the right edge of the minimap indicating how much of the buffer is displayed by the minimap. This line is only displayed if the minimap can scroll.
* add a `lineOverdraw` setting that allow to change the number of additional lines to render in the minimap. Bigger values will increase render time but will reduce the number of redraws during scrolling.

1.1.0 / 2014-05-16
==================

* removes obsolete minimap contextual menu

1.0.2 / 2014-05-15
==================

* fix inconsistent arguments passed to `eachMinimapView` callbacks for already existing minimaps

1.0.1 / 2014-05-12
==================

* fix with-minimap class removed from pane on tab close


1.0.0 / 2014-05-11
==================

* minimap views are now created for each editor and not for each pane
* add a `eachMinimapView` subscription method in `Minimap` class
* add a view aware minimap rendering, it speeds up rendering and updates for large files
* add delegation of `MinimapRenderView` methods in `MinimapView`, allowing to manipulate most of its API directory from a minimap view
* add a lines API on `MinimapRenderView` allowing to decorates lines with classes even when they are not rendered yet


0.10.0 / 2014-05-11
===================

* add Minimap.versionMatch method allowing plugins to test against minimap version

0.9.8 / 2014-05-08
==================

* add Customizing Style to Readme

0.9.7 / 2014-05-08
==================

* better rendering for ASCII characters, fix #69

0.9.6 / 2014-05-07
==================

* fix error on closing an image view pane
* add Travis CI

0.9.5 / 2014-05-04
==================

* add reference to the new highlight-selected plugin

0.9.4 / 2014-05-01
==================

* fix item move to other pane, both panes's minimap updates #65

0.9.3 / 2014-04-25
==================

* Properly stick to the editor line height

0.9.1 / 2014-04-13
==================

* fix minimap doesn't update on active view changes when auto-toggle is true, #59

0.9.0 / 2014-04-11
==================

* add minimap indicator
* split updateScrollX and updateScrollY

0.8.0 / 2014-04-10
==================

* minimap api
* minimap plugin manager

0.7.0 / 2014-04-05
==================

* use `prolix` mixin for debug
* add plugins list
* `find-and-replace` and `git-diff` now available!

0.6.0 / 2014-04-04
==================

* fix broken minimap activation on non editor view, #46
* move resizeend to main file

0.5.0 / 2014-04-03
==================

* drag-to-scroll
* using `ctrl-k ctrl-m` toggle the minimap without the logs
* using `ctrl-k ctrl-d` toggle the minimap with the logs

0.4.0 / 2014-04-02
==================

* update redacted font, fixed instead of regular
* expose an instance of a Minimap class
* refactor view to have the same structure ad editor view
* move resizeend.js to vendor dir
* store pane id as a local variable to minimize bloats
* fix scrolling when on Vim mode or in Find pane
* disalbed syncing scroll when `scroll-left-changed` of editor

0.3.0 / 2014-03-31
==================

* add `minimap-wrapper` container, wrapped `minimap-editor` and `minimap-overlayer`
* add `with-minimap` css class to pane, #16
* responsive support for minimap and tweaks css styles
* `minimap-overlayer` displayed by default, #25
* add test cases, #28
* refactor minimap views, #32
* feature minimap partial update, performance improvement #35
* subscribe `screen-lines-changed` of editor and syncing

0.2.2 / 2014-03-20
==================

* fix `@miniScrollView.data('top')` doesn't reset to 0 after switch with files

0.2.1 / 2014-03-20
==================

* supports window resize
* improve style

0.2.0 / 2014-03-19
==================

* supports to multi `paneViews`, by @abe33
* add simple `click-to-scroll`, no animation
* use css3 transform instead of left/top
* fix minimap obscured when tree view to toggled to right side of window, #9, by @Orangetronic
* fix not display empty line

0.1.4 / 2014-03-17
==================

* add Redacted font, improves styles, by @abe33
* refactors updateMinimapView
* add a config.js, defualts config
* add scrollLeft and scrollTop on minimap, sync to editor
* fix #10, js erors when opening image files

0.0.4 / 2014-03-16
==================

* add gray overlayer, toggle display over/leave
* support mousewheel, sync editor and minimap scrollTop


0.0.3 / 2014-03-14
==================

* fix #2, minimap is appearing on the right when opening settings tab
* fix #3, opening settings tab breaks when minimap is use

0.0.2 / 2014-03-13
==================

* add minimap-editor-view
* add monitor tab-bar and file-tree
