/**
 * Created by Yc on 2016/6/9.
 */
~function(){
    marked.setOptions({
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    });
    renderer = new marked.Renderer();
    var map = {};
    renderer.heading = function (text, level) {
        var escapedText = text.toLowerCase();
        if(!!map[text])
            escapedText+='-'+map[text]++;
        else
            map[text]=1;
        return '<h' + level + '><a name="' +
            escapedText +
            '" class="anchor" href="#' +
            escapedText +
            '"><span class="header-link"></span></a>' +
            text + '</h' + level + '>';
    };
}();
