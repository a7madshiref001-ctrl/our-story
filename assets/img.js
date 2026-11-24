/* ضغط الصور على الموبايل قبل الرفع — الصورة بتنزل من 4MB لحوالي 250KB */
window.OS_IMG = {
  compress: function (file, max, q) {
    max = max || 1400; q = q || 0.82;
    function draw(src, w, h) {
      var k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(function (b) { res(b || file); }, 'image/jpeg', q); });
    }
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bm) { return draw(bm, bm.width, bm.height); })
        .catch(function () { return viaImg(); });
    }
    return viaImg();
    function viaImg() {
      return new Promise(function (res, rej) {
        var u = URL.createObjectURL(file), im = new Image();
        im.onload = function () { draw(im, im.naturalWidth, im.naturalHeight).then(function (b) { URL.revokeObjectURL(u); res(b); }); };
        im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('img')); };
        im.src = u;
      });
    }
  }
};
