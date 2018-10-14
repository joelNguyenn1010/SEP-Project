var myChart1 = echarts.init(document.getElementById('sb1'));

myChart1.clear();

var option1 = {
 	baseOption: {
        timeline: {
            axisType: 'category',
            autoPlay: false,
            playInterval: 1000,
            data: ['2018'],
            label: {
                formatter : function(s) {
                    return (new Date(s)).getFullYear();
                },
                interval: 0
            }
        },
        title: {
            subtext: 'Purchase Status'
        },
        tooltip : {
        trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                label: {
                    show: true
                }
            }
        },
        legend: {
            x: 'right',
            orient: 'vertical',
            data: setLegendData()
        },
        calculable : true,
        grid: {
            top: 80,
            bottom: 100,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    label: {
                    	show: true,
                        formatter: function (params) {
                                    return params.value.replace('\n', '');
                                }
                            }
                        }
                    }
                },
        xAxis: [
            {
                'type':'category',
                'axisLabel':{'interval':0},
                'data':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'],
                splitLine: {show: false}
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Quantity'
            }
        ],
        dataZoom: [
            {
                show: true,
                height: 20,
                start: 0,
                end: 100,
                bottom:"10%", 
            },
            {
                type: 'inside',
                start: 0,
                end: 80
            },
            {
                show: true,
                yAxisIndex: 0,
                filterMode: 'empty',
                width: 30,
                height: '70%',
                showDataShadow: false,
                left: '1%'
            }
        ],
        series: setSeries()
    },
	options: [{title:{text: '2018 UTS Library Stationary Status'}, series:setOptionsSeries()}]
};

myChart1.setOption(option1);

function setSeries(){
	var series = [];
	for(var i in data){
        if(parseInt(data[i].quantity) != 0){
		  var s = {name: data[i].name+" ("+data[i].stationary_id+")", type: 'bar'};
		  series.push(s);
        }
	}
	return series;
}

function setLegendData(){
	var legend = [];
	for(var i in data){
		var s = {name: data[i].name+" ("+data[i].stationary_id+")"};
		legend.push(s);
	}
	return legend;
}

function setOptionsSeries(){
	var series = [];
	for(var i=0;i<data.length; i++){
		var arr = Array(12);
		arr[parseInt(data[i].purchase_date.substring(5,7))-1] = parseInt(data[i].quantity);
		series[i] = {};
		series[i].data = arr;
	}
	return series;
}

function test() {
    console.log(data);
}

