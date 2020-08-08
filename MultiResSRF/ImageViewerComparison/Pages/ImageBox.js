var ImageBox = function(parent, config) {
    var box = this;
    
    this.elements = config.elements;
    this.names = config.names;
    this.insetNum = config.insetNum;

    this.selectorGroup = document.createElement("div"); 
    this.selectorGroup.className = "selector-group";
    
    this.selectors = [];
    for (var i = 0; i < this.elements.length; i++) {
        var selector = document.createElement("div");
        if (i < this.insetNum)
            selector.className = "selector selector-primary";
        else
            selector.className = "selector selector-secondary";

        if (i == 0)
            selector.className += " active";
        selector.appendChild(document.createTextNode(this.names[i]));
        
        selector.addEventListener("mouseover", function(idx, event) {
            this.selectImage(idx);
        }.bind(this, i));
        
        this.selectors.push(selector);
        this.selectorGroup.appendChild(selector);
    }
    
    var title = document.createElement("h1"); 
    title.className = "image-box-title";
    title.appendChild(document.createTextNode(config.title));

    // ----- Add by Kevin -----
    var inputText = document.createElement("h2");
    inputText.className = "image-box-subtitle";
    inputText.appendChild(document.createTextNode("RGB-D Input (Color/Depth)"));
    var compareText = document.createElement("h2");
    compareText.className = "image-box-subtitle";
    compareText.appendChild(document.createTextNode("Comparison"));
    var compareSubText = document.createElement("h3");
    var lineBreak = document.createElement("br");
    compareSubText.className = "common-text";
    // compareSubText.appendChild(document.createTextNode("15ms for single-pass methods: JBF/SRF and 7.5ms for multi-resolution methods: M-JBU/M-SRF"));
    // Add input images.
    this.inputColor = document.createElement("img"); 
    this.inputColor.src = config.colorInput;
    this.inputColor.className = "input-display";
    this.inputColor.width = 640;
    // this.inputColor.height = 640.0 * (this.inputHeight) / (this.inputWidth);
    this.inputDepth = document.createElement("img"); 
    this.inputDepth.src = config.depthInput;
    this.inputDepth.className = "input-display";
    this.inputDepth.width = 640;
    // this.inputDepth.height = 640.0 * (this.inputHeight) / (this.inputWidth);
    // ----- Add by Kevin -----
    
    this.display = document.createElement("img"); 
    this.display.src = this.elements[0];
    this.display.className = "image-display";
    
    this.containerDiv = document.createElement("div"); 
    this.containerDiv.className = "image-box";
    this.containerDiv.appendChild(title);
    this.containerDiv.appendChild(document.createElement("hr"));

    // ----- Add by Kevin -----
    this.containerDiv.appendChild(inputText);
    this.containerDiv.appendChild(this.inputColor);
    this.containerDiv.appendChild(this.inputDepth);
    this.containerDiv.appendChild(document.createElement("hr"));
    this.containerDiv.appendChild(compareText);
    this.containerDiv.appendChild(compareSubText);
    // ----- Add by Kevin -----

    this.containerDiv.appendChild(this.selectorGroup);
    this.containerDiv.appendChild(this.display);

    document.addEventListener("keypress", function(event) { box.keyPressHandler(event); });
    // ----- Add by Kevin -----
    document.addEventListener("mouseover", function(event) {box.updateInsetSize(); });
    this.currentWidth = window.innerWidth;
    this.maxInsetSize = config.insetSize;
    // ----- Add by Kevin -----

    if (config.enableInsets) {
        this.insetBox = document.createElement("div");
        this.insetBox.className = "image-inset-box";
        this.insetBox.style.display = 'none';
        document.body.appendChild(this.insetBox);

        this.insetZoom = config.insetZoom;
        this.insetSize = config.insetSize;

        // Adjust inset size.
        if (window.innerWidth > 1280) {
            this.insetSize = this.maxInsetSize;
        }
        else {
            var ratio = window.innerWidth / 1280;
            this.insetSize = Math.round(this.maxInsetSize * ratio);
        }
        
        // this.insetSize = Math.floor(Math.max(document.documentElement.clientWidth, window.innerWidth || 0)/this.elements.length) - 10;
        this.insets = []
        this.insetContainers = []
        for (var i = 0; i < this.insetNum; i++) {
            var insetImage = document.createElement("div");
            insetImage.className = "image-inset pixelated";
            insetImage.style.width = this.insetSize + "px";
            insetImage.style.height = this.insetSize + "px";
            insetImage.style.backgroundImage = "url('" + this.elements[i] + "')";
            insetImage.style.backgroundRepeat = "no-repeat";
            
            var insetContainer = document.createElement("div");
            insetContainer.className = "image-inset-container";
            insetContainer.style.width = this.insetSize + "px";
            insetContainer.appendChild(insetImage);
            insetContainer.appendChild(document.createTextNode(this.names[i]));
            
            this.insetBox.appendChild(insetContainer);
            this.insets.push(insetImage);
            this.insetContainers.push(insetContainer);
        }
        this.display.addEventListener("mouseover", function(event) { box.mouseOverHandler(); });
        this.display.addEventListener("mouseout",  function(event) { box.mouseOutHandler (); });
        this.display.addEventListener("mousemove", function(event) { box.mouseMoveHandler(event); });
        this.insetBox.addEventListener("mouseover", function(event) { box.mouseOverHandler(); });
        this.insetBox.addEventListener("mouseout",  function(event) { box.mouseOutHandler (); });
        this.insetBox.addEventListener("mousemove", function(event) { box.mouseMoveHandler(event); });
    }
    
    this.dummyImage = new Image();
    this.dummyImage.src = this.elements[0];
    this.dummyImage.addEventListener('load', function(e) { box.setupInsets(); });
    if (this.dummyImage.complete)
        this.setupInsets();
        
    
    parent.appendChild(this.containerDiv);
}

ImageBox.prototype.setupInsets = function() {
    var format = this.dummyImage.naturalWidth *this.insetZoom + "px "
               + this.dummyImage.naturalHeight*this.insetZoom + "px";
    for (var i = 0; i < this.insets.length; i++)
        this.insets[i].style.backgroundSize = format
}

ImageBox.prototype.selectImage = function(idx) {
    for (var i = 0; i < this.elements.length; i++) {
        if (i == idx)
            this.selectors[i].className += " active";
        else
            this.selectors[i].className = this.selectors[i].className.replace( /(?:^|\s)active(?!\S)/g , '');
    }

    this.display.src = this.elements[idx];
}

ImageBox.prototype.updateInsetSize = function() {
    if (window.innerWidth != this.currentWidth) {
        if (window.innerWidth > 1280) {
            this.insetSize = this.maxInsetSize;
        }
        else {
            var ratio = window.innerWidth / 1280;
            this.insetSize = Math.round(this.maxInsetSize * ratio);
        }
        // console.log(this.insetSize);
        for (var i = 0; i < this.elements.length; i++) {
            var image = this.insetContainers[i].childNodes[0];
            image.style.width = this.insetSize + "px";
            image.style.height = this.insetSize + "px";
            this.insetContainers[i].style.width = this.insetSize + "px";
        }
        this.currentWidth = window.innerWidth;
    }
}

ImageBox.prototype.keyPressHandler = function(event) {
    var inc = event.charCode == "+".charCodeAt(0);
    var dec = event.charCode == "-".charCodeAt(0);
    if (inc || dec) {
        if (inc)
            this.insetSize *= 2;
        else
            this.insetSize /= 2;
        for (var i = 0; i < this.elements.length; i++) {
            var image = this.insetContainers[i].childNodes[0];
            image.style.width = this.insetSize + "px";
            image.style.height = this.insetSize + "px";
            this.insetContainers[i].style.width = this.insetSize + "px";
        }
    } else {
        var idx = parseInt(event.charCode) - "1".charCodeAt(0);
        if (idx >= 0 && idx < this.elements.length)
            this.selectImage(idx);
    }
}

ImageBox.prototype.mouseOverHandler = function() {
    /*for (var i = 0; i < this.insets.length; i++) {
        this.insets[i].style.backgroundImage = "url('" + this.elements[i] + "')";
        this.insetContainers[i].style.color = 'black';
    }*/
    this.insetBox.style.display = 'block';
}

ImageBox.prototype.mouseOutHandler = function() {
    /*for (var i = 0; i < this.insets.length; i++) {
        this.insets[i].style.backgroundImage = "none";
        this.insetContainers[i].style.color = 'white';
    }*/
    this.insetBox.style.display = 'none';
}

ImageBox.prototype.mouseMoveHandler = function(event) {
    var rect = this.display.getBoundingClientRect();
    var xCoord = Math.floor((event.clientX - rect.left)*this.display.naturalWidth /this.display.width );
    var yCoord = Math.floor((event.clientY - rect.top )*this.display.naturalHeight/this.display.height);
    
    for (var i = 0; i < this.insets.length; i++) {
        var xScroll = this.insets[i].clientWidth /2 - xCoord*this.insetZoom;
        var yScroll = this.insets[i].clientHeight/2 - yCoord*this.insetZoom;
        this.insets[i].style.backgroundPosition = xScroll + "px " + yScroll + "px";
    }
}