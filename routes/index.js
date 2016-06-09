
/*
 * GET home page.
 */
var fs = require('fs');
var url = require('url');
var archiver = require('archiver');
var marked = require('marked');
var hl = require('highlight.js');

function loadZip(file,rela,req,res) {
    var state = fs.statSync(file);
    var filename = rela.substring(rela.lastIndexOf('/')+1);
    console.log('zip',filename)
    var archive = archiver('zip');
    archive.on('error', function(err){throw err;});
    archive.pipe(res);
    if(state.isDirectory()) archive.directory(file,filename);
    else archive.file(file,{name:filename});
    archive.finalize();
}

var statPr = function (root,file) {
  var deferred = Q.defer();
  fs.stat(root+'/'+file,function (err, stats) {
    if(err) deferred.reject(err);
    else {
        stats.name = file;
        stats.type = stats.isDirectory()?'文件夹':'文件';
        deferred.resolve(stats, root);
    }
  });
  return deferred.promise;
};
var statP = function(root,file){
	return new Promise(function(resolve){
	  fs.stat(root+'/'+file,function (err, stats) {
		var t = {};
		if(err){
			t.reason=err;
			resolve(t);
		}
		else {
		   t.state='ok';
	       stats.name = file;
	       stats.type = stats.isDirectory()?'文件夹':'文件';
		   t.value=stats;
	       resolve(t);
	    }
	  });
	})
}


function loadDir(r,rela,req,res) {
  fs.readdir(r,function (err,files) {
    if(err) throw err;
    if(r!==root){
        var d = r.substring(0,r.lastIndexOf('/'));
        Promise.resolve(d).then(v=>{
            fs.readdir(v,function (err, files) {
                if(err) throw err;
                fn(files,r.substring(r.lastIndexOf('/')+1));
            })
        })
    }else {
        fn();
    }
    function fn(list,f) {
        var o ={};
        if(list){
            var i = list.indexOf(f);
            if(i>=0) {
                o.prev = list[i - 1];
                o.next = list[i + 1];
            }
        }
        Promise.all(files.map((x,i,a)=>{return statP(r,x);}))
            .then(function (results) {
				var values=[];
				results.forEach(x=>{
					if(x.state==='ok'){
						values.push(x.value);
					}else
						console.error(x.reason);
				});
                res.render('file',Object.extend(o,
                    {
                        title:'HTTP文件查看',
                        dirname:rela,
                        files : values.map(x=> {
                            return {
                                type: x.type,
                                name: x.name,
                                time: x.mtime.format(),
                                size: x.size.toSize()
                            };
                        })
                    })
                );
            },console.error)
    }
  });
}
Number.prototype.toSize = function () {
    if(this<1024){
        return this+"B";
    }else if(this<1024<<10){
        return (this/1024).toFixed(2)+"KB";
    }else if(this<1024<<20){
        return (this/(1024<<10)).toFixed(2)+"MB";
    }else{
        return (this/(1024<<20)).toFixed(2)+"GB";
    }
}
Object.extend = function (src) {
    Array.prototype.slice.call(arguments,1)
        .forEach(x=>{
            for(var k in x)
                src[k]=x[k];
        })
    return src;
}
function loadFile(file,rela,noraw,res){
    if(!!noraw){
        if(file!==root){
            var d = file.substring(0,file.lastIndexOf('/'));
            Promise.resolve(d).then(v=>{
                fs.readdir(v,(err,files)=>{
                    fn(files,file.substring(file.lastIndexOf('/')+1));
                })
            });
        }else fn();
        function fn(list,f) {
            var o ={};
            if(list){
                var i = list.indexOf(f);
                if(i>=0) {
                    o.prev = list[i - 1];
                    o.next = list[i + 1];
                }
            }
            o = Object.extend(o,{
                dirname:rela,
                title:f,
                src:f
            });

            if(f.match(/\.(avi|mp4|mkv|rmvb|mpg|rm|wma)$/i)){
                res.render('video',o);
            }else if(f.match(/\.(jpg|png|bmp|jpeg|gif)$/i)){
                res.render('img',o);
            }else if(f.match(/\.(mp3|wma|aac)$/i)){
                res.render('audio',o);
            }else if(f.match(/\.(md|markdown)$/i)){
                fs.readFile(file,(error,data) => {
                    if(error) throw error;
                    o.content = data.toString();
                    res.render('md',o);
                });
            }else if(f.match(/\.(java|c|cpp|js|css|jsp|php|json|txt)$/i)){
                fs.readFile(file,(error,data) => {
                    if(error) throw error;
                    // console.time('hl');
                    // o.content=hl.highlightAuto(data.toString()).value;
                    // console.timeEnd('hl');
                    o.content = data.toString();
                    res.render('code',o);
                });
            }else if(f.match(/\.(html|htm)$/i)){
                fs.readFile(file,(error,data) => {
                    if(error) throw error;
                    o.content = data.toString();
                    res.render('html',o);
                });
            }else{
                res.sendFile(rela,{root:global.root});
            }
        }
    }else{
        res.sendFile(rela,{root:global.root});
    }
}

exports.index = function(req, res){
    var arg = url.parse(req.originalUrl,true),
        query = arg.query;
    var root = global.root;
    var r = decodeURIComponent(arg.pathname);
    r=r==='/'?'':r;

    var t = r.replace(/(\/$)/g,'');
    console.info(r,t,query);
    if(!query.compress){
        var state = fs.statSync(root+r);
        if(state.isDirectory())
            loadDir(root+t,t, req, res);
        else
            loadFile(root+t,t,query.noraw,res);
    }else{
        loadZip(root+t,t,req,res);
    }
};

Date.prototype.format = function (fmt) { //author: meizz
    fmt = fmt || 'yyyy/MM/dd hh:mm';
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}