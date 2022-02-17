define(["require", "loading", "dialogHelper", "mainTabsManager", "formDialogStyle", "emby-checkbox", "emby-select", "emby-toggle"],
    function (require, loading, dialogHelper, mainTabsManager) {
        var pluginId = "9ECAAC5F-435E-4C21-B1C0-D99423B68984";
       

        function getTabs() {
            return [
                {
                    href: Dashboard.getConfigurationPageUrl('DiskSpacePluginConfigurationPage'),
                    name: "Cards"
                },
                {
                    href: Dashboard.getConfigurationPageUrl('DiskSpacePluginTableConfigurationPage'),
                    name: "Table"
                },
                {
                    href: Dashboard.getConfigurationPageUrl('DiskSpacePluginPolarAreaConfigurationPage'),
                    name: "Available Space"
                },
                {
                    href: Dashboard.getConfigurationPageUrl('DiskSpacePluginSettingsConfigurationPage'),
                    name: "Settings"
                }
            ];
        }

        function renderDiskSpaceResultChartHtml(driveData, config, chartResultContainer, Chart) {
        
            var html = '';
            html += '<div style="width:100%; height:100%">';
            html += '<canvas id="barChart" style="max-height:100% !important;"></canvas>';
            html += '</div>';
            
            chartResultContainer.innerHTML += html;

            const ctx = chartResultContainer.querySelector('#barChart').getContext("2d");
            
            driveData.sort(function(a, b){return b.FreeSpace - a.FreeSpace});
            driveData = driveData.filter(d => d.IsMonitored);
            const driveFreeSpaceData = driveData.map(d => { return Math.round((d.FreeSpace) / 1073741824.0) });

            const driveDataNames = driveData.map(d => { return d.FriendlyName });

            const driveDataFreeSpaceFriendly = driveData.map(d => { return d.FriendlyAvailable });

            const myChart = new Chart(ctx,
                {
                    type: 'horizontalBar',
                    //label: driveDataNames,
                    data: {
                        labels: driveDataNames,
                        datasets: [
                            {
                                data: driveFreeSpaceData,
                                backgroundColor: config.UsedColor,
                                borderColor: ["white"],
                                dataFriendly: driveDataFreeSpaceFriendly,
                            }
                        ]
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        animation: { easing: 'linear' },
                        tooltips: {
                            callbacks: {
                                title: (tooltipItem, data) => { return data['labels'][tooltipItem[0]['index']]; },
                                label: (tooltipItem, data) => { return data['datasets'][0]['dataFriendly'][tooltipItem['index']]; },
                                
                            }
                        }
                    }
                });
              myChart.options.legend.display = false;
        }

        async function renderChartData(view, Chart) {

            const config = await ApiClient.getPluginConfiguration(pluginId);

            const chartRenderContainer = view.querySelector('.diskSpaceChartResultBody');

            chartRenderContainer.innerHTML = '';

            const driveData = await ApiClient.getJSON(ApiClient.getUrl("GetDriveData"));

            var html = '';
            if (driveData.Error) {
                html += '<h1>' + driveData.Error + '</h1>';
                chartRenderContainer.innerHTML = html;
                return;
            }

            renderDiskSpaceResultChartHtml(driveData, config, chartRenderContainer, Chart);

        }

        return function (view) {

            view.addEventListener('viewshow',
                async () => {

                    mainTabsManager.setTabs(this, 2, getTabs);

                    var data = await ApiClient.getJSON(ApiClient.getUrl('GetTotalStorage'));
                    view.querySelector('.totalStorage').innerHTML = 'Total Storage: ' + data.Total;
                      
                    require([Dashboard.getConfigurationResourceUrl('Chart.js')],
                        async (chart) => {
                            await renderChartData(view, chart);
                        });
                });
        }
    });