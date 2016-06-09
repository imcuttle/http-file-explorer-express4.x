/**
 * Created by Yc on 2016/6/9.
 */
!function () {
    hljs.initHighlightingOnLoad();
    var i =document.getElementById('html-show');
    i.contentWindow.onload = function(){
        var h= 30+i.contentDocument.body.clientHeight;
        if(i.clientHeight<h)
            i.style.height = h+'px';
    };
}()
