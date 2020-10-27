/**
 * @constructor
 */
var VpaidVideoPlayer = function() {
  /**
   * The slot is the div element on the main page that the ad is supposed to
   * occupy.
   * @type {Object}
   * @private
   */
  this.slot_ = null;

  /**
   * The video slot is the video element used by the ad to render video content.
   * @type {Object}
   * @private
   */
  this.videoSlot_ = null;

  /**
   * An object containing all registered events.  These events are all
   * callbacks for use by the vpaid ad.
   * @type {Object}
   * @private
   */
  this.eventsCallbacks_ = {};

  /**
   * A list of getable and setable attributes.
   * @type {Object}
   * @private
   */
  this.attributes_ = {
    'companions' : '',
    'desiredBitrate' : 256,
   // 'duration' : 30,
    'expanded' : false,
    'height' : 0,
    'icons' : '',
    'linear' : true,
    'remainingTime' : 10,
    'skippableState' : false,
    'viewMode' : 'normal',
    'width' : 0,
    'volume' : 1.0
  };

  /**
   * A set of events to be reported.
   * @type {Object}
   * @private
   */
  this.quartileEvents_ = [
    {event: 'AdVideoStart', value: 0},
    {event: 'AdVideoFirstQuartile', value: 25},
    {event: 'AdVideoMidpoint', value: 50},
    {event: 'AdVideoThirdQuartile', value: 75},
    {event: 'AdVideoComplete', value: 100}
  ];

  /**
   * @type {number} An index into what quartile was last reported.
   * @private
   */
  this.lastQuartileIndex_ = 0;

  /**
   * An array of urls and mimetype pairs.
   *
   * @type {!object}
   * @private
   */
  this.parameters_ = {};
};


/**
 * VPAID defined init ad, initializes all attributes in the ad.  The ad will
 * not start until startAd is called.
 *
 * @param {number} width The ad width.
 * @param {number} height The ad heigth.
 * @param {string} viewMode The ad view mode.
 * @param {number} desiredBitrate The desired bitrate.
 * @param {Object} creativeData Data associated with the creative.
 * @param {Object} environmentVars Variables associated with the creative like
 *     the slot and video slot.
 */
VpaidVideoPlayer.prototype.initAd = function(
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
  // slot and videoSlot are passed as part of the environmentVars
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.attributes_['desiredBitrate'] = desiredBitrate;
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;

  // Parse the incoming parameters.
  if (creativeData['AdParameters']) {
    this.parameters_ = JSON.parse(creativeData['AdParameters']);
  }

  this.updateVideoSlot_()
  this.videoSlot_.addEventListener(
      'timeupdate',
      this.timeUpdateHandler_.bind(this),
      false);
  this.videoSlot_.addEventListener(
      'ended',
      this.stopAd.bind(this),
      false);
      
};



/**
 * Called when the overlay is clicked.
 * @private
 */
VpaidVideoPlayer.prototype.overlayOnClick_ = function() {
  this.callEvent_('AdClickThru');
};


/**
 * Called by the video element.  Calls events as the video reaches times.
 * @private
 */
VpaidVideoPlayer.prototype.timeUpdateHandler_ = function() {
  if (this.lastQuartileIndex_ >= this.quartileEvents_.length) {
    return;
  }
  var percentPlayed =
      this.videoSlot_.currentTime * 100.0 / this.videoSlot_.duration;
  if (percentPlayed >= this.quartileEvents_[this.lastQuartileIndex_].value) {
    var lastQuartileEvent = this.quartileEvents_[this.lastQuartileIndex_].event;
    this.eventsCallbacks_[lastQuartileEvent]();
    this.lastQuartileIndex_ += 1;
  }
};


var globalWrapper;

/**
 * @private
 */
VpaidVideoPlayer.prototype.updateVideoSlot_ = function() {
  if (this.videoSlot_ == null) {
    this.videoSlot_ = document.createElement('video');
    //this.log('Warning: No video element passed to ad, creating element.');
  }

  this.videoSlot_.ontimeupdate = function (e) {
    if ((this.videoSlot_.currentTime + 1) >= this.videoSlot_.duration) {
      this.videoSlot_.pause();
      this.videoSlot_.onplay = function () {
        this.videoSlot_.currentTime = 0;
        this.videoSlot_.onplay = null;
      }.bind(this);
    }
    if (this.videoSlot_.currentTime >= 2) {
      makeSmallVideo.bind(this)();
    }
    this.videoSlot_.style.backgroundColor = "#0000";
  }.bind(this);

  globalWrapper = document.createElement("div");
  globalWrapper.style.position = "absolute";
  globalWrapper.style.top = "0";
  globalWrapper.style.bottom = "0";
  globalWrapper.style.left = "0";
  globalWrapper.style.right = "0";

  globalWrapper.appendChild(this.videoSlot_);

  this.slot_.appendChild(globalWrapper);
  
  this.videoSlot_.setAttribute('src', this.parameters_.videoUrl);

  this.updateVideoPlayerSize_();

  this.callEvent_('AdLoaded');
  this.callEvent_('AdImpression');
  
  this.videoSlot_.play();
};


/**
 * Helper function to update the size of the video player.
 * @private
 */
VpaidVideoPlayer.prototype.updateVideoPlayerSize_ = function() {
  this.videoSlot_.setAttribute('width', this.attributes_['width']);
  this.videoSlot_.setAttribute('height', this.attributes_['height']);
};


/**
 * Returns the versions of vpaid ad supported.
 * @param {string} version
 * @return {string}
 */
VpaidVideoPlayer.prototype.handshakeVersion = function(version) {
  return ('2.0');
};

var wrapper;
var grid;
var socialNetworkWrapper;
var txtTitle;
var content;
var btnClose;

function makeSmallVideo() {

  this.videoSlot_.style.transition = "all .5s";
  this.videoSlot_.style.width = "323px";
  this.videoSlot_.style.height = "185px";
  this.videoSlot_.style.marginTop = "90px";
  this.videoSlot_.style.marginLeft = "12px";

  this.videoSlot_.controls = true;

  if (btnClose) {
    btnClose.style.display = "block";
  }
}

function build() {
  var img = new Image();
  img.src = this.parameters_.baseUrlImages + "img/explorar.png";
  var img2 = new Image();
  img2.src = this.parameters_.baseUrlImages + "img/caracteristicas.png";
  var img3 = new Image();
  img3.src = this.parameters_.baseUrlImages + "img/strongrace.png";

  this.videoSlot_.style.zIndex = "5";
  this.slot_.onmouseenter = function () {
    makeSmallVideo.bind(this)();
  }.bind(this);

  this.slot_.onmouseleave = function () {
    /*this.videoSlot_.style.transition = "all .5s";
    this.videoSlot_.style.width = "100%";
    this.videoSlot_.style.height = "100%";
    this.videoSlot_.style.marginTop = "0";
    this.videoSlot_.style.marginLeft = "0";
*/
    this.videoSlot_.controls = false;
  }.bind(this);

  globalWrapper.style.backgroundImage = "url(" + this.parameters_.baseUrlImages + "img/explorar.png)";
  globalWrapper.style.backgroundRepeat = "no-repeat";
  globalWrapper.style.backgroundSize = "cover";
  globalWrapper.style.position = "absolute";

  wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "0";
  wrapper.style.left = "0";
  wrapper.style.right = "0";
  wrapper.style.bottom = "0";
  
  var menuWrapper = getMenu.bind(this)();
  wrapper.appendChild(menuWrapper);

  btnClose = document.createElement("div");
  btnClose.style.position = "absolute";
  btnClose.style.width = "16px";
  btnClose.style.height = "16px";
  btnClose.style.top = "5px";
  btnClose.style.right = "5px";
  btnClose.style.backgroundRepeat = "no-repeat";
  btnClose.style.backgroundSize = "contain";
  btnClose.style.backgroundImage = "url(" + this.parameters_.baseUrlImages + "img/close.png)";
  btnClose.style.zIndex = "5000";
  btnClose.style.cursor = "pointer";
  btnClose.style.display = "none";

  btnClose.onclick = function () {
    //if (globalWrapper) globalWrapper.remove();
    this.stopAd.bind(this)();
    
  }.bind(this);

  wrapper.appendChild(btnClose);

  getExploreTab.bind(this)(wrapper);

  this.slot_.appendChild(wrapper);

}

function getExploreTab(wrapper) {
  var socialNetworkWrapper = getSocialNetworkFor.bind(this)('explore');
  wrapper.appendChild(socialNetworkWrapper);
  
  var btn = document.createElement("button");
  btn.textContent = "Inicia tu compra online >";
  btn.style.position = "absolute";
  btn.style.bottom = "24px";
  btn.style.right = "24px";
  btn.style.width = "224px";
  btn.style.height = "40px";
  btn.style.background = "#44a9df";
  btn.style.border = "none";
  btn.style.outline = "none";
  btn.style.color = "#fff";
  btn.style.fontFamily = "Antenna-bold";
  btn.style.cursor = "pointer";
  btn.onclick = function () {
    window.open("https://www.cotizacion.ford.com/compra-online/index-desktop.asp?codigo=ranger&utm_source=ford.com.ar");
  }

  wrapper.appendChild(btn);
}

function getFeaturesTab(wrapper) {
  txtTitle = document.createElement("div");
  txtTitle.textContent = "¿Por qué elegir un Ford Ranger?";
  txtTitle.style.width = "100%";
  txtTitle.style.fontFamily = "Antenna-black";
  txtTitle.style.color = "#fff";
  txtTitle.style.textAlign = "center";
  txtTitle.style.position = "absolute";
  txtTitle.style.top = "85px";
  txtTitle.style.fontSize = "20px";
  txtTitle.style.userSelect = "none";

  wrapper.appendChild(txtTitle);


  grid = document.createElement("div");
  grid.style.position = "absolute";
  grid.style.bottom = "0";
  grid.style.top = "120px";
  grid.style.left = "0";
  grid.style.right = "0";
  /*grid.style.display = "flex";
  grid.style.flexWrap = "wrap";*/

  var img1 = document.createElement("div");
  img1.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-1.png) #fff";
  img1.style.height = "158px";
  img1.style.width = "160px";
  img1.style.backgroundRepeat = "no-repeat";
  img1.style.backgroundSize = "cover";
  img1.style.position = "absolute";
  img1.style.cursor = "pointer";

  var obscurer1 = document.createElement("div");
  obscurer1.style.opacity = "0";
  obscurer1.style.width = "100%";
  obscurer1.style.height = "100%";
  obscurer1.style.background = "linear-gradient(#fff0, #42a4d8)";
  obscurer1.style.display = "flex";
  obscurer1.style.justifyContent = "center";
  obscurer1.style.alignItems = "flex-end";
  obscurer1.style.color = "#fff";
  obscurer1.style.fontFamily = "Antenna-black";

  var txt1 = document.createElement("div");
  txt1.textContent = "TECNOLOGÍA >";
  txt1.style.marginBottom = "10px";
  txt1.style.fontSize = "15px";
  txt1.style.userSelect = "none";

  img1.appendChild(obscurer1);
  img1.onmouseover = function () {
    obscurer1.style.opacity = "1";
  }
  img1.onmouseout = function () {
    obscurer1.style.opacity = "0";
  }
  img1.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/tecnologia/");
  }
  
  obscurer1.appendChild(txt1);
  grid.appendChild(img1);

  var img2 = document.createElement("div");
  img2.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-2.png) #fff";
  img2.style.height = "83px";
  img2.style.width = "161px";
  img2.style.backgroundRepeat = "no-repeat";
  img2.style.backgroundSize = "cover";
  img2.style.position = "absolute";
  img2.style.left = "162px";
  img2.style.cursor = "pointer";

  var obscurer2 = document.createElement("div");
  obscurer2.style.opacity = "0";
  obscurer2.style.width = "100%";
  obscurer2.style.height = "100%";
  obscurer2.style.background = "linear-gradient(#fff0, #42a4d8)";
  obscurer2.style.display = "flex";
  obscurer2.style.justifyContent = "center";
  obscurer2.style.alignItems = "flex-end";
  obscurer2.style.color = "#fff";
  obscurer2.style.fontFamily = "Antenna-black";

  var txt2 = document.createElement("div");
  txt2.textContent = "ACCESORIOS >";
  txt2.style.marginBottom = "10px";
  txt2.style.fontSize = "15px";
  txt2.style.userSelect = "none";

  img2.appendChild(obscurer2);
  img2.onmouseover = function () {
    obscurer2.style.opacity = "1";
  }
  img2.onmouseout = function () {
    obscurer2.style.opacity = "0";
  }
  img2.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/accesorios/");
  }
  
  obscurer2.appendChild(txt2);
  grid.appendChild(img2);

  var img3 = document.createElement("div");
  img3.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-3.png) #fff";
  img3.style.height = "83px";
  img3.style.width = "161px";
  img3.style.backgroundRepeat = "no-repeat";
  img3.style.backgroundSize = "cover";
  img3.style.position = "absolute";
  img3.style.left = "325px";
  img3.style.cursor = "pointer";

  var obscurer3 = document.createElement("div");
  obscurer3.style.opacity = "0";
  obscurer3.style.width = "100%";
  obscurer3.style.height = "100%";
  obscurer3.style.background = "linear-gradient(#fff0, #42a4d8)";
  obscurer3.style.display = "flex";
  obscurer3.style.justifyContent = "center";
  obscurer3.style.alignItems = "flex-end";
  obscurer3.style.color = "#fff";
  obscurer3.style.fontFamily = "Antenna-black";

  var txt3 = document.createElement("div");
  txt3.textContent = "MODELOS >";
  txt3.style.marginBottom = "10px";
  txt3.style.fontSize = "15px";
  txt3.style.userSelect = "none";

  img3.appendChild(obscurer3);
  img3.onmouseover = function () {
    obscurer3.style.opacity = "1";
  }
  img3.onmouseout = function () {
    obscurer3.style.opacity = "0";
  }
  img3.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/comparar-modelos/");
  }
  
  obscurer3.appendChild(txt3);
  grid.appendChild(img3);

  var img4 = document.createElement("div");
  img4.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-4.png) #44a9df";
  img4.style.height = "83px";
  img4.style.width = "150px";
  img4.style.backgroundRepeat = "no-repeat";
  img4.style.backgroundSize = "contain";
  img4.style.backgroundPosition = "center";
  img4.style.position = "absolute";
  img4.style.left = "489px";
  
  grid.appendChild(img4);

  var img5 = document.createElement("div");
  img5.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-5.png) #fff";
  img5.style.height = "155px";
  img5.style.width = "161px";
  img5.style.backgroundRepeat = "no-repeat";
  img5.style.backgroundSize = "cover";
  img5.style.position = "absolute";
  img5.style.left = "162px";
  img5.style.top = "85px";
  img5.style.cursor = "pointer";

  var obscurer5 = document.createElement("div");
  obscurer5.style.opacity = "0";
  obscurer5.style.width = "100%";
  obscurer5.style.height = "100%";
  obscurer5.style.background = "linear-gradient(#fff0, #42a4d8)";
  obscurer5.style.display = "flex";
  obscurer5.style.justifyContent = "center";
  obscurer5.style.alignItems = "flex-end";
  obscurer5.style.color = "#fff";
  obscurer5.style.fontFamily = "Antenna-black";

  var txt5 = document.createElement("div");
  txt5.textContent = "SEGURIDAD >";
  txt5.style.marginBottom = "10px";
  txt5.style.fontSize = "15px";
  txt5.style.userSelect = "none";

  img5.appendChild(obscurer5);
  img5.onmouseover = function () {
    obscurer5.style.opacity = "1";
  }
  img5.onmouseout = function () {
    obscurer5.style.opacity = "0";
  }
  img5.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/seguridad/");
  }
  
  obscurer5.appendChild(txt5);
  grid.appendChild(img5);

  var img6 = document.createElement("div");
  img6.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-6.png) #fff";
  img6.style.height = "155px";
  img6.style.width = "314px";
  img6.style.backgroundRepeat = "no-repeat";
  img6.style.backgroundSize = "cover";
  img6.style.position = "absolute";
  img6.style.left = "325px";
  img6.style.top = "85px";
  img6.style.cursor = "pointer";

  var obscurer6 = document.createElement("div");
  obscurer6.style.opacity = "0";
  obscurer6.style.width = "100%";
  obscurer6.style.height = "100%";
  obscurer6.style.background = "linear-gradient(#fff0, #42a4d8)";
  obscurer6.style.display = "flex";
  obscurer6.style.justifyContent = "center";
  obscurer6.style.alignItems = "flex-end";
  obscurer6.style.color = "#fff";
  obscurer6.style.fontFamily = "Antenna-black";

  var txt6 = document.createElement("div");
  txt6.textContent = "DISEÑO >";
  txt6.style.marginBottom = "10px";
  txt6.style.fontSize = "15px";
  txt6.style.userSelect = "none";

  img6.appendChild(obscurer6);
  img6.onmouseover = function () {
    obscurer6.style.opacity = "1";
  }
  img6.onmouseout = function () {
    obscurer6.style.opacity = "0";
  }
  img6.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/galeria/");
  }
  
  obscurer6.appendChild(txt6);
  
  grid.appendChild(img6);

  var img7 = document.createElement("div");
  img7.style.background = "url(" + this.parameters_.baseUrlImages + "img/grid/grid-7.png) #fff";
  img7.style.height = "80px";
  img7.style.width = "160px";
  img7.style.backgroundRepeat = "no-repeat";
  img7.style.backgroundSize = "cover";
  img7.style.position = "absolute";
  img7.style.top = "160px";
  
  grid.appendChild(img7);


  var socialNetworkWrapper = getSocialNetworkFor.bind(this)('features');
  img7.appendChild(socialNetworkWrapper);

  wrapper.appendChild(grid);
}

function getSocialNetworkFor(what) {
  socialNetworkWrapper = document.createElement("div");

  socialNetworkWrapper.style.position = "absolute";
  if (what === 'explore') {
    socialNetworkWrapper.style.bottom = "30px";
    socialNetworkWrapper.style.left = "12px";
    socialNetworkWrapper.style.width = "300px";
    socialNetworkWrapper.style.display = "flex";
  }
  if (what === 'features') {
    socialNetworkWrapper.style.bottom = "0px";
    socialNetworkWrapper.style.left = "-10px";
    socialNetworkWrapper.style.width = "158px";
    socialNetworkWrapper.style.height = "73px";
    socialNetworkWrapper.style.display = "flex";
    socialNetworkWrapper.style.alignItems = "center";
    socialNetworkWrapper.style.justifyContent = "center";
    socialNetworkWrapper.style.flexWrap = "wrap";
  }
  var btnInstagram = document.createElement("button");
  btnInstagram.style.border = "none";
  btnInstagram.style.outline = "none";
  btnInstagram.style.background = "url(" + this.parameters_.baseUrlImages + "img/instagram.png)";
  btnInstagram.style.backgroundRepeat = "no-repeat";
  btnInstagram.style.backgroundSize = "cover";
  btnInstagram.style.width = "20px";
  btnInstagram.style.height = "20px";
  btnInstagram.style.marginLeft = "10px";
  btnInstagram.style.cursor = "pointer";
  btnInstagram.onclick = function () {
    window.open("https://www.instagram.com/fordargentina/");
  }

  socialNetworkWrapper.appendChild(btnInstagram);

  var btnFb = document.createElement("button");
  btnFb.style.border = "none";
  btnFb.style.outline = "none";
  btnFb.style.background = "url(" + this.parameters_.baseUrlImages + "img/facebook.png)";
  btnFb.style.backgroundRepeat = "no-repeat";
  btnFb.style.backgroundSize = "cover";
  btnFb.style.width = "20px";
  btnFb.style.height = "20px";
  btnFb.style.marginLeft = "10px";
  btnFb.style.cursor = "pointer";
  btnFb.onclick = function () {
    window.open("https://www.facebook.com/fordargentina/");
  }

  socialNetworkWrapper.appendChild(btnFb);

  var btnYt = document.createElement("button");
  btnYt.style.border = "none";
  btnYt.style.outline = "none";
  btnYt.style.background = "url(" + this.parameters_.baseUrlImages + "img/youtube.png)";
  btnYt.style.backgroundRepeat = "no-repeat";
  btnYt.style.backgroundSize = "cover";
  btnYt.style.width = "20px";
  btnYt.style.height = "20px";
  btnYt.style.marginLeft = "10px";
  btnYt.style.cursor = "pointer";
  btnYt.onclick = function () {
    window.open("https://www.youtube.com/fordargentina");
  }

  socialNetworkWrapper.appendChild(btnYt);

  var txtArgentina = document.createElement("div");
  txtArgentina.style.display = "inline-block";
  txtArgentina.style.color = "#fff";
  txtArgentina.style.lineHeight = "20px";
  txtArgentina.style.height = "20px";
  txtArgentina.style.userSelect = "none";
  txtArgentina.style.marginLeft = "10px";
  txtArgentina.style.fontSize = "15px";
  txtArgentina.style.fontFamily = "Roboto";
  txtArgentina.textContent = "/fordargentina";
  socialNetworkWrapper.appendChild(txtArgentina);

  return socialNetworkWrapper;
}

function getStrongRaceTab(wrapper) {
  txtTitle = document.createElement("div");
  txtTitle.textContent = "Descubre el concepto de Raza Fuerte";
  txtTitle.style.width = "100%";
  txtTitle.style.fontFamily = "Antenna-black";
  txtTitle.style.color = "#363636";
  txtTitle.style.userSelect = "none";
  txtTitle.style.textAlign = "center";
  txtTitle.style.position = "absolute";
  txtTitle.style.top = "85px";
  txtTitle.style.fontSize = "20px";

  wrapper.appendChild(txtTitle);

  content = document.createElement("div");
  content.style.position = "absolute";
  content.style.width = "215px";
  content.style.height = "215px";
  content.style.top = "118px";
  content.style.left = "30px";
  content.style.padding = "10px";

  var h2 = document.createElement("h2");
  h2.textContent = "Raza Fuerte";
  h2.style.color = "#fff";
  h2.style.margin = "10px 0";
  h2.style.fontFamily = "Antenna-bold";
  h2.style.userSelect = "none";
  h2.style.fontSize = "20px";
  content.appendChild(h2);

  var txt = document.createElement("p");
  txt.innerHTML = "Ranger sintetiza el concepto de la Raza Fuerte en el Siglo XXI: es una Pick-Up robusta e imponente, y a la vez, moderna, sofisticada y aerodinámica.<br><br>- Caja de transferencia 4x4<br>- Indicador de marchas<br>- Capacidad de Vadeo";
  txt.style.color = "#fff";
  txt.style.margin = "0";
  txt.style.fontFamily = "Roboto";
  txt.style.fontSize = "15px";
  txt.style.lineHeight = "20px";
  txt.style.userSelect = "none";

  content.appendChild(txt);

  wrapper.appendChild(content);
  
  var btn = document.createElement("button");
  btn.textContent = "CONOCÉ MÁS >";
  btn.style.position = "absolute";
  btn.style.bottom = "24px";
  btn.style.right = "24px";
  btn.style.width = "224px";
  btn.style.height = "40px";
  btn.style.background = "#44a9df";
  btn.style.border = "none";
  btn.style.outline = "none";
  btn.style.color = "#fff";
  btn.style.fontFamily = "Antenna-bold";
  btn.style.cursor = "pointer";
  btn.onclick = function () {
    window.open("https://www.ford.com.ar/crossovers-suvs-4x4/nueva-ranger/robustez/");
  }

  wrapper.appendChild(btn);
}

function getMenu() {
  var menuWrapper = document.createElement("div");
  menuWrapper.style.position = "absolute";
  menuWrapper.style.height = "35px";
  menuWrapper.style.top = "25px";
  menuWrapper.style.left = "142px";
  menuWrapper.style.right = "0px";

  var btnExplore = getBaseBtn();
  var btnFeatures = getBaseBtn();
  var btnStrongRace = getBaseBtn();

  btnExplore.textContent = "Explorar Ranger";
  btnExplore.style.borderBottom = "5px #fff solid";
  btnExplore.style.color = "#40a9e0";

  btnExplore.onclick = function () {
    if (grid) grid.remove();
    if (socialNetworkWrapper) socialNetworkWrapper.remove();
    if (txtTitle) txtTitle.remove();
    if (content) content.remove();
    
    getExploreTab.bind(this)(wrapper);
    globalWrapper.style.background = "url(" + this.parameters_.baseUrlImages + "img/explorar.png) #fff";
    this.videoSlot_.play();
    this.videoSlot_.style.display = "block";
    btnExplore.style.borderBottom = "5px #fff solid";
    btnExplore.style.color = "#40a9e0";
    btnFeatures.style.borderBottom = "5px #0000 solid";
    btnFeatures.style.color = "#fff";
    btnStrongRace.style.borderBottom = "5px #0000 solid";
    btnStrongRace.style.color = "#fff";

  }.bind(this);

  menuWrapper.appendChild(btnExplore);


  btnFeatures.textContent = "Características";

  btnFeatures.onclick = function () {
    if (grid) grid.remove();
    if (socialNetworkWrapper) socialNetworkWrapper.remove();
    if (txtTitle) txtTitle.remove();
    if (content) content.remove();

    getFeaturesTab.bind(this)(wrapper);
    globalWrapper.style.background = "url(" + this.parameters_.baseUrlImages + "img/caracteristicas.png) #fff";
    this.videoSlot_.pause();
    this.videoSlot_.style.display = "none";
    btnExplore.style.borderBottom = "5px #0000 solid";
    btnExplore.style.color = "#fff";
    btnFeatures.style.borderBottom = "5px #fff solid";
    btnFeatures.style.color = "#40a9e0";
    btnStrongRace.style.borderBottom = "5px #0000 solid";
    btnStrongRace.style.color = "#fff";
  }.bind(this)

  menuWrapper.appendChild(btnFeatures);


  btnStrongRace.textContent = "Raza Fuerte";

  btnStrongRace.onclick = function () {
    if (grid) grid.remove();
    if (socialNetworkWrapper) socialNetworkWrapper.remove();
    if (txtTitle) txtTitle.remove();
    if (content) content.remove();

    getStrongRaceTab.bind(this)(wrapper);    
    globalWrapper.style.background = "url(" + this.parameters_.baseUrlImages + "img/strongrace.png) #fff";
    this.videoSlot_.pause();
    this.videoSlot_.style.display = "none";
    btnExplore.style.borderBottom = "5px #0000 solid";
    btnExplore.style.color = "#fff";
    btnFeatures.style.borderBottom = "5px #0000 solid";
    btnFeatures.style.color = "#fff";
    btnStrongRace.style.borderBottom = "5px #fff solid";
    btnStrongRace.style.color = "#40a9e0";
  }.bind(this);

  menuWrapper.appendChild(btnStrongRace);

  return menuWrapper;
}

function getBaseBtn() {
  var btn = document.createElement("button");
  btn.style.background = "#0000";
  btn.style.height = "100%";
  btn.style.width = "33%";
  btn.style.fontFamily = "Antenna-bold";
  btn.style.border = "none";
  btn.style.borderBottom = "5px #0000 solid";
  btn.style.outline = "none";
  btn.style.color = "#fff";
  btn.style.cursor = "pointer";

  btn.onmouseenter = function () {
    this.style.background = "#0004";
  }
  btn.onmouseleave = function () {
    this.style.background = "#0000";
  }

  return btn;
}

/**
 * Called by the wrapper to start the ad.
 */
VpaidVideoPlayer.prototype.startAd = function() {

  var newFont = document.createElement('style');

  newFont.appendChild(document.createTextNode("@font-face { font-family: Antenna-bold; src: url('" + this.parameters_.fonts.AntennaBold + "') format('opentype'); }"));
  newFont.appendChild(document.createTextNode("@font-face { font-family: Antenna-black; src: url('" + this.parameters_.fonts.AntennaBlack + "') format('opentype'); }"));
  newFont.appendChild(document.createTextNode("@font-face { font-family: Roboto; src: url('" + this.parameters_.fonts.RobotoRegular + "') format('opentype'); }"));

  top.document.head.appendChild(newFont);
  build.bind(this)();

  this.callEvent_('AdStarted');
};


/**
 * Called by the wrapper to stop the ad.
 */
VpaidVideoPlayer.prototype.stopAd = function() {
  //this.log('Stopping ad');
  // Calling AdStopped immediately terminates the ad. Setting a timeout allows
  // events to go through.
  var callback = this.callEvent_.bind(this);
  setTimeout(callback, 75, ['AdStopped']);
};


/**
 * @param {number} value The volume in percentage.
 */
VpaidVideoPlayer.prototype.setAdVolume = function(value) {
  this.attributes_['volume'] = value;
  //this.log('setAdVolume ' + value);
  this.callEvent_('AdVolumeChange');
};


/**
 * @return {number} The volume of the ad.
 */
VpaidVideoPlayer.prototype.getAdVolume = function() {
  //this.log('getAdVolume');
  return this.attributes_['volume'];
};


/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidVideoPlayer.prototype.resizeAd = function(width, height, viewMode) {
  //this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  this.updateVideoPlayerSize_();
  this.callEvent_('AdSizeChange');
};


/**
 * Pauses the ad.
 */
VpaidVideoPlayer.prototype.pauseAd = function() {
  //this.log('pauseAd');
  this.videoSlot_.pause();
  this.callEvent_('AdPaused');
};


/**
 * Resumes the ad.
 */
VpaidVideoPlayer.prototype.resumeAd = function() {
  //this.log('resumeAd');
  this.videoSlot_.play();
  this.callEvent_('AdResumed');
};


/**
 * Expands the ad.
 */
VpaidVideoPlayer.prototype.expandAd = function() {
  //this.log('expandAd');
  this.attributes_['expanded'] = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
  this.callEvent_('AdExpanded');
};


/**
 * Returns true if the ad is expanded.
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdExpanded = function() {
  //this.log('getAdExpanded');
  return this.attributes_['expanded'];
};


/**
 * Returns the skippable state of the ad.
 * @return {boolean}
 */
VpaidVideoPlayer.prototype.getAdSkippableState = function() {
  //this.log('getAdSkippableState');
  return this.attributes_['skippableState'];
};


/**
 * Collapses the ad.
 */
VpaidVideoPlayer.prototype.collapseAd = function() {
  //this.log('collapseAd');
  this.attributes_['expanded'] = false;
};


/**
 * Skips the ad.
 */
VpaidVideoPlayer.prototype.skipAd = function() {
  //this.log('skipAd');
  var skippableState = this.attributes_['skippableState'];
  if (skippableState) {
    this.callEvent_('AdSkipped');
  }
};


/**
 * Registers a callback for an event.
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VpaidVideoPlayer.prototype.subscribe = function(
    aCallback,
    eventName,
    aContext) {
  //this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.eventsCallbacks_[eventName] = callBack;
};


/**
 * Removes a callback based on the eventName.
 *
 * @param {string} eventName The callback type.
 */
VpaidVideoPlayer.prototype.unsubscribe = function(eventName) {
  //this.log('unsubscribe ' + eventName);
  this.eventsCallbacks_[eventName] = null;
};


/**
 * @return {number} The ad width.
 */
VpaidVideoPlayer.prototype.getAdWidth = function() {
  return this.attributes_['width'];
};


/**
 * @return {number} The ad height.
 */
VpaidVideoPlayer.prototype.getAdHeight = function() {
  return this.attributes_['height'];
};


/**
 * @return {number} The time remaining in the ad.
 */
VpaidVideoPlayer.prototype.getAdRemainingTime = function() {
  return this.attributes_['remainingTime'];
};


/**
 * @return {number} The duration of the ad.
 */
VpaidVideoPlayer.prototype.getAdDuration = function() {
  return this.attributes_['duration'];
};


/**
 * @return {string} List of companions in vast xml.
 */
VpaidVideoPlayer.prototype.getAdCompanions = function() {
  return this.attributes_['companions'];
};


/**
 * @return {string} A list of icons.
 */
VpaidVideoPlayer.prototype.getAdIcons = function() {
  return this.attributes_['icons'];
};


/**
 * @return {boolean} True if the ad is a linear, false for non linear.
 */
VpaidVideoPlayer.prototype.getAdLinear = function() {
  return this.attributes_['linear'];
};


/**
 * Logs events and messages.
 *
 * @param {string} message
 */
VpaidVideoPlayer.prototype.log = function(message) {
 // console.log(message);
};


/**
 * Calls an event if there is a callback.
 * @param {string} eventType
 * @private
 */
VpaidVideoPlayer.prototype.callEvent_ = function(eventType) {
    //console.log('?????');
    //console.log(eventType);
//this.log(eventType);
  if (eventType in this.eventsCallbacks_) {
    this.eventsCallbacks_[eventType]();
  }
};


/**
 * Callback for when the mute button is clicked.
 * @private
 */
VpaidVideoPlayer.prototype.muteButtonOnClick_ = function() {
  if (this.attributes_['volume'] == 0) {
    this.attributes_['volume'] = 1.0;
  } else {
    this.attributes_['volume'] = 0.0;
  }
  this.callEvent_('AdVolumeChange');
};


/**
 * Main function called by wrapper to get the vpaid ad.
 * @return {Object} The vpaid compliant ad.
 */
var getVPAIDAd = function() {
  return new VpaidVideoPlayer();
};
