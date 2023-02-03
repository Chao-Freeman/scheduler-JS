(function(w){
    /**
     * Schedule:{name,ID,date,thisptr,callback,type,args,creater(hidden)}
     */
    /**
     * schds:{
     *      name:Schedule
     *  }
     */
    var schds={};//This is where the schedule stores
    /**
     * sortedschds:[
     *      Schedule
     *  ]
     *
    var sortedschds=[];//This is sorted schedule by time.

    function setschd(obj)
    {
        var t=obj.date,i=0,j=sortedschds.length,k;
        schds[obj.name]=obj;
        while(i<=j)
        {
            k=(i+j)/2;
            if(sortedschds[k].date<obj.date)
            {
                i=k;
            }else j=k;
        }
    }*/

    //Constants
    w.SCHD_ONCE=0;//Default, Only calls callback once
    w.SCHD_REPEATIVE=1;//Calls callback repeativly until remove

    /**
     * @see Time
     */
    w.SCHD_MS=0;//Default, Calls after a delay(in milliseconds) from now
    w.SCHD_TIME=2;//Calls at a specific time every day, ignores Date part. Can be constructed by calling Time.
    w.SCHD_DATETIME=4;//Calls at a specific time on the specific date, ignores SCHD_REPEATIVE

    /**
     * Convert something to a time
     * @param  {...any} time The time to be converted(On local timezone)
     * @returns A date specify the time
     */
    w.Time=function(...time)
    {
        return new Date("1970-01-01 "+time.join(":"));
    }

    /**
     * setTimeout/setInterval to obj
     * @param {Object} obj Schedule
     * @returns TimeoutID
     */
    function setSchdOnBrowser(obj)
    {
        var f=setTimeout,func=once,tout,type=obj.type;
        function once(args)
        {
            obj.callback.apply(obj.thisptr,args);
            remove(obj.name);
        }
        switch(type>>1)
        {
            case 0:{//SCHD_MS
                if(type&SCHD_REPEATIVE){
                    f=setInterval;
                }
                tout=obj.date;
                break;
            }
            case 1:{//SCHD_TIME
                if(type&SCHD_REPEATIVE){
                    func=function(args)
                    {
                        obj.callback.apply(obj.thisptr,args);
                        obj.ID=setTimeout(func,86400000-((new Date()-obj.date)%86400000),args);
                    }
                }
                tout=86400000-((new Date()-obj.date)%86400000);
                break;
            }
            case 2:{//SCHD_DATETIME
                tout=obj.date-new Date();
                break;
            }
        }
        obj.ID=f(func,tout,obj.args);
        Object.defineProperty(obj,"creater",{value:f});
        return obj.ID;
    }
    /**
     * Creates a new schedule
     * @param {*} ID The id of the schedule
     * @param {Function} callback Callback function
     * @param {*} type Some constants of prefix SCHD_
     * @param {Date|Number} time 
     * @param {...any} args Arguments to be passed when calling callback
     * @returns The schedule detail created. NOTE:THIS VALUE IS REWRITEABLE, AND MAY CAUSES SERIOUS PROBLEM.
     */
    function create(ID, callback, type, time, ...args){
        var schd={
            name:ID,
            ID:null,
            date:time,
            thisptr:this,
            callback:callback,
            type:type,
            args:args
        };
        schds[ID]=schd;
        setSchdOnBrowser(schd);
        return schd;
    }
    /**
     * Get a schedule detail by ID
     * @param {*} ID The id of the schedule
     * @returns The schedule detail. NOTE:THIS VALUE IS REWRITEABLE, AND MAY CAUSES SERIOUS PROBLEM.
     */
    function get(ID){
        return schds[ID];
    }
    /**
     * Set a schedule
     * @see create
     */
    function set(ID, callback, type, time, ...args){
        if(schds[ID]!==undefined)
        {
            remove(ID);
        }
        return create.apply(null,arguments);
    }
    /**
     * Removes a schedule
     * @param {*} ID The id of the schedule
     * @returns {Boolean} True if success
     */
    function remove(ID)
    {
        var obj=schds[ID];
        if(obj.creater===setTimeout)
        {
            clearTimeout(obj.ID);
        }else clearInterval(obj.ID);
        return delete schds[ID];
    }
    Object.prototype.schdcreate=create;
    Object.prototype.schdget=get;
    Object.prototype.schdset=set;
    Object.prototype.schdremove=remove;
//Object.defineProperty(Object,"scheduler",scheduler);
})(window)