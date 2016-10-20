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
