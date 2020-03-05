
//---自定义处理方法20200107-xpb---------------------------




var inputFileAcceptDefult = "image/*";		//默认只允许上传图片，需要上传其他的类型设置input的data-fileAccept比如视频：data-fileAccept="video/*"	任意文件：data-fileAccept="*/*"

var errorImg = "http://jssdk.demo.qiniu.io/images/default.png";		//不是图片的文件展示默认图

var maxFile = 20;	//文件大小配置

var reg = new RegExp("advPicQiNiu", "g");		//通用替换的正则

$(function(){
	
	//初始化七牛上传token			
	initQiNiu();
	window.setInterval(initQiNiu, 1000*60*20); // 启动计时器timer处理函数，20分钟执行一次*//**/
				
	//初始化页面引用七牛上传的
	$(".qinNiuUploadResources").each(function(){
		var inputName = $(this).attr("name");
		var inputVal = $(this).val();
		var inputMaxFile = $(this).attr("data-maxFile");
		
		
		var maxFileThis = parseInt(inputMaxFile);
		if(isNaN(maxFileThis)){
			//不是数值-用默认的
			maxFileThis = maxFile;
		}
		
		
		var fileAccept = $(this).attr("data-fileAccept");
		if(typeof(fileAccept)=="string"){
			if(fileAccept.length < 1){
				fileAccept = inputFileAcceptDefult;
			}
		}else{
			fileAccept = inputFileAcceptDefult;
			
		}
		
		intiQiNiuHtml(inputName,inputVal,this,maxFileThis,fileAccept);
		
	});
	
	
	//testInput();
})
	


/*     function testInput(){
	
	refreshInputVal("ico","ico_Preview");
	
	
}; */





var qiNiuIntCou = 0;

function initQiNiu() {

    qiNiuIntCou++;

    //console.log("初始化七牛前端上传....第几次:"+qiNiuIntCou);

    //获取上传token，成功后初始化绑定上传事件
    $.ajax({
    	url: getRootPath()+'/zghlj/wx/voting/getQinniuToken',
	        success: function(res){
	            res = JSON.parse(res);

	            var token = res.uptoken;
	            //var domain = res.domain;
	            var domain = 'http://cdn.zghlj.wang';
	            var config = {
	                useCdnDomain: true,
	                disableStatisticsReport: false,
	                retryCount: 6
	            };
	            var putExtra = {
	                fname: "",
	                params: {},
	                mimeType: null
	            };

	            uploadWithSDK(token, putExtra, config, domain);
	        }
    })

}


//加载中图片
var loadingImg = "http://cdn.zghlj.wang/20200107155347-HA4BNG-loading.gif";


//七牛上传方法
function uploadWithSDK(token, putExtra, config, domain) {
    //通过class绑定多个上传file
    $(".selectQiNiuUp").unbind("change").bind("change",function(){


        //获取上传的input 的id用来区分多个上传时各自的进度及上传结果处理
        var thisId= $(this).attr("id");
        
        thisId = thisId.replace("_file","");
        console.log("thisId："+thisId);




        var file = this.files[0];
        var finishedAttr = [];
        var compareChunks = [];
        var observable;
        if (file) {

            var maxfs = $("#"+thisId).attr("data-maxFile");
            
            
            var maxFileThis = parseInt(maxfs);
			if(isNaN(maxFileThis)){
				//不是数值-用默认的
				maxFileThis = maxFile;
			}
            
			
            //-------------------

            var key = file.name;

            // 判断文件大小100M
            if (file.size > 1024 * 1024 * maxFileThis) {
                alert('文件大小超过设置的'+maxFileThis+'M');
                return false;
            }
        	//-------------------------------------------------
        	
            //添加加载中
            var olId = thisId+"_Preview";		//展示图片的ol的id
            

            var imgCouNumberNow = 0;
            if($("#"+olId).children("li").length>0){
            	 //获取最后一个图片的id
                //var lastChildIdObj = $("#"+olId);
                
                var lastChildId = $("#"+olId).children("li:last-child").children("img").attr("id");
                console.log("-------------最后一个图片的id:"+lastChildId);
                //获取最后一个的数值
                var spls = lastChildId.split("_");
                var imgCou = spls[spls.length-1];

                imgCouNumberNow = parseInt(imgCou)+1;
            }
           
            
            console.log("-------------最后一个图片的的数值:"+imgCou);
			var imgLi =	"\t\t<li>\n" +
		    "\t\t\t<img id=\"advPicQiNiu_img_couNiu\" style=\"max-width:maxWidth:100px;height:100px;margin-bottom: 2px;\" src=\""+loadingImg+"\" url=\"qiNiuImgVal\">&nbsp;&nbsp;<a href=\"javascript:\" onclick=\"icoDelById('advPicQiNiu_img_couNiu');\">×</a>\n" +
			"\t\t\t<span id=\"advPicQiNiu_jindu_couNiu\" style=\"margin-left: 3%;\">0%</span>\n" +
		    "\t\t</li>\n";
            
		    

		    //var regImg = new RegExp("qiNiuImgVal", "g");
		    var regImgCou = new RegExp("advPicQiNiu_img_couNiu", "g");

		    var regImgCouJd = new RegExp("advPicQiNiu_jindu_couNiu", "g");

		    
		    
		    imgLi = imgLi.replace(regImgCou, "advPicQiNiu_img_"+imgCouNumberNow);
		    imgLi = imgLi.replace(regImgCouJd,"advPicQiNiu_jindu_"+imgCouNumberNow);
		    imgLi = imgLi.replace(reg, thisId);

		    $("#"+olId).append(imgLi);
		    
		    

		    var jinDuId = thisId+"_jindu_"+imgCouNumberNow;		//进度ID
		    var thisImgId = thisId+"_img_"+imgCouNumberNow;		//这个图片的ID
            
            

            putExtra.params["x:name"] = key.split(".")[0];


            // 设置next,error,complete对应的操作，分别处理相应的进度信息，错误信息，以及完成后的操作
            var error = function(err) {

                console.log(err);
                alert("上传出错");
                $("#"+jinDuId).html(""+ "出错");
            };


            //上传完成后通知处理
            var complete = function(res) {
                //
                if(res.key ){
                    var fileUrl = domain+'/'+res.key;
                    if (res.key.match(/\.(jpg|jpeg|png|gif)$/)) {
                        //图片文件
                        // $("#jinDu_"+thisId).append("<img style='width: 100px;max-height: 300px' src='"+fileUrl+"' >");
                        
                        $("#"+thisImgId).attr("src",fileUrl);
                        $("#"+thisImgId).attr("url",fileUrl);
                        
                    }else{
                        //非图片文件
                        // $("#jinDu_"+thisId).append("<img style='width: 100px;max-height: 300px' src='http://jssdk.demo.qiniu.io/images/default.png' >");
                        
                        $("#"+thisImgId).attr("src",errorImg);
                        $("#"+thisImgId).attr("url",fileUrl);
                    }

                    //上传成功刷新input的值
                    
                    refreshInputVal(thisId,olId);

                }else {
                	$("#"+jinDuId).html(""+ "出错？");
                }
               
            };


            //上传进度
            var next = function(response) {
                var chunks = response.chunks||[];
                var total = response.total;
                // 这里对每个chunk更新进度，并记录已经更新好的避免重复更新，同时对未开始更新的跳过
                for (var i = 0; i < chunks.length; i++) {
                    if (chunks[i].percent === 0 || finishedAttr[i]){
                        continue;
                    }
                    if (compareChunks[i].percent === chunks[i].percent){
                        continue;
                    }
                    if (chunks[i].percent === 100){
                        finishedAttr[i] = true;
                    }

                }

                $("#"+jinDuId).html("" + total.percent.toFixed(2) + "% ");

                compareChunks = chunks;
            };

            var subObject = {
                next: next,
                error: error,
                complete: complete
            };
            var subscription;

            //修改文件上传名称
            var nameTou = dateFtt(new Date(), "yyyyMMddhhmmss")+"-"+randomn(6)+"-";

            var szm = "x";	//首字母

            //key = nameTou+szm;
            key = nameTou+szm+'.'+key.split(".")[1];
            console.log("文件名称："+domain+'/'+key);

            //var lj ="文件路径："+domain+'/'+key;

            //$("#urlText").append("<p>"+lj+"</p>");


            // 调用sdk上传接口获得相应的observable，控制上传和暂停
            observable = qiniu.upload(file, key, token, putExtra, config);

            //
            subscription = observable.subscribe(subObject);


        }
    })
}	
	



function refreshInputVal(inputId,olId){
	
	var imgs  ="";
	
	$("#"+olId).children("li").each(function(){
		var im = $(this).children("img").attr("url");
		if(im != null && im != '' && im !='qiNiuImgVal'){
			if(imgs == ""){
				imgs = im
			}else{
				imgs = imgs + ","+im;
			}
		}else{
			console.log("图片链接不存在？？im:"+im);
		}
		
	});
	
	$("#"+inputId).val(imgs);
	
	console.log("图片链接imgs:"+imgs);
}



function dateFtt(date,fmt) { //author: meizz
    if(fmt==null){
        fmt = 'yyyy-MM-dd hh:mm:ss';
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), 	
        "S": date.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function randomn(n) {
    if(n==null){
        n=6;
    }
    var res = ''
    for (; res.length < n; res += Math.random().toString(36).substr(2).toUpperCase()) {}
    return res.substr(0, n)
}



function getRootPath() {
	//获取当前网址，
	var curPath = window.document.location.href;
	//获取主机地址之后的目录，
	var pathName = window.document.location.pathname;
	var pos = curPath.indexOf(pathName);
	//获取主机地址
	var localhostPaht = curPath.substring(0, pos);
	//获取带"/"的项目名，
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	return(localhostPaht);
}
			
	




function intiQiNiuHtml(name,picVal,tdObj,maxFile,fileAccept){
	

	var imgLi =	"\t\t<li>\n" +
			    "\t\t\t<img id=\"advPicQiNiu_img_couNiu\" style=\"max-width:maxWidth:100px;height:100px;margin-bottom: 2px;\" src=\"qiNiuImgVal\" url=\"qiNiuImgVal\" onerror=\"this.onerror='';src='"+ errorImg +"'\" >&nbsp;&nbsp;<a href=\"javascript:\" onclick=\"icoDelById('advPicQiNiu_img_couNiu');\">×</a>\n" +
    			//"\t\t\t<span id=\"advPicQiNiu_jindu_0\" style=\"margin-left: 3%;\">100%</span>\n" +
			    "\t\t</li>\n";

	
	var qiNiuHtml = "<input id=\"advPicQiNiu\" name=\"advPicQiNiu\"  data-maxFile=\""+maxFile+"\"  class=\"form-control required\" type=\"hidden\" value=\""+picVal+"\" aria-required=\"true\">\n" +
    "\t<ol id=\"advPicQiNiu_Preview\">\n" +
    "\t</ol>\n" +
    "\t\n" +
    "\t<input type=\"file\" class=\"selectQiNiuUp\"  style=\"display: none;\"  id=\"advPicQiNiu_file\" accept=\""+fileAccept+"\">\n" +
    "\t\n" +
    "\t<a href=\"javascript:\" onclick=\"qiNiuFinderOpen('advPicQiNiu');\" class=\"btn btn-primary\">添加</a>\n" +
    "\t&nbsp;\n" +
    "\t<a href=\"javascript:\" onclick=\"qiNiuDelAll('advPicQiNiu');\" class=\"btn btn-default\">清除</a>";

 	var consoleStr= qiNiuHtml.replace(reg, name);
    
	$(tdObj).parent().html(consoleStr);		//初始化基础代码
	//已有图片回显
	if(picVal != null && picVal != ''){
		var pics =  picVal.split(",");
		var olId = name+"_Preview";		//展示图片的ol的id
		
		var regImg = new RegExp("qiNiuImgVal", "g");
		var regImgCou = new RegExp("advPicQiNiu_img_couNiu", "g");
		
		for (var i=0;i<pics.length;i++){
			
			var imglis = imgLi.replace(regImg, pics[i]);

			imglis = imglis.replace(regImgCou, "advPicQiNiu_img_"+i);
			imglis = imglis.replace(reg, name);
			
			$("#"+olId).append(imglis);
			
		}
			
	}
	
}


//统一清除按钮处理
function qiNiuDelAll(name){
	$("#"+name).val('');		//清空input值
	var olId = name+"_Preview";		//展示图片的ol的id
	$("#"+olId).html('');		//清空input值
}

//统一添加按钮处理
function qiNiuFinderOpen(name){
	document.getElementById(name+"_file").click();
}


function icoDelById(imgId){
	
	$("#"+imgId).parent().remove();
	
	var inputName = imgId.split("_")[0];
	
	refreshInputVal(inputName,inputName+"_Preview");
	
	
}


	
	