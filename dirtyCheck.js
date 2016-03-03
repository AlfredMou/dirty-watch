function Scope(){
	this.$$watchList=[];
}

Scope.prototype._$watch = function(watchFn,listenFn) {
	this.$$watchList.push({
		watchFn:watchFn,
		listenFn:listenFn
	});
};
//脏检测,不断检测知道整个变量列表稳定
Scope.prototype._$dirty=function(){
	var isDirty;
	do{
		isDirty=false;
		isDirty=this._$$dirty();
	}while(isDirty);

}

Scope.prototype._$$dirty=function(){
	var isDirty=false,self=this;
	this.$$watchList.forEach(function(watch){
		var newValue=watch.watchFn.apply(self);
		var old=watch.old;
		if(self._$$dirtysingle(old,newValue)){
			if(watch.listenFn){
				watch.listenFn(old,newValue);
			}
			isDirty=true;
		}
		watch.old=newValue;
	});
	return isDirty;
}
//单例检测
Scope.prototype._$$dirtysingle=function(oldValue,newValue){
	if(typeof oldValue!=typeof newValue){
		return true;
	}
	if((typeof newValue=="string"||typeof newValue=="number"||typeof newValue =="boolean")&&newValue!=oldValue){
		return true;
	}	
	if(typeof newValue == "object"){
		if(newValue instanceof Array){
			for(var i=0,len=newValue.length;i<len;i++){
				if(newValue[i]!=oldValue[i]){
					return true;
				}
			}
		}else if(newValue instanceof Function){
			//暂不检测函数
			return false;
		}else{
			for(var name in newValue){
				if(newValue.hasOwnProperty(name)){
					if(oldValue.hasOwnProperty(name)){
						if(this._$$dirtysingle(oldValue[name],newValue[name])){
							return true;
						};
					}else{
						return true
					}
				}
			}
		}
	}
	return false;

}

var $rootScope=new Scope();

$($("input[ng-model]").on("change",function(){
	testScope._$dirty();
}));


var contrallor=function(name,callBack){
	var contrallorNode=$("*[ng-controller="+name+"]");
	var nodeInnerHtml=contrallorNode.html();
	callBack($rootScope);
	for(var name in $rootScope){
		if(scope.hasOwnProperty(name)&&name!=="$$watchList"){
			scope._$watch(function(){
				return scope[name]
			});
		}
	}
}

var simpleTemplete=function(str,data){
	var reg = /\${(.*?)}/g;
	return str.replace(reg,function($1,$2){
        return data[$2]||$1;
    });
}