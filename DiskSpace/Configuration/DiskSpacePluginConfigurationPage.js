define(["require", "loading", "dialogHelper", "mainTabsManager", "formDialogStyle", "emby-checkbox", "emby-select", "emby-toggle"],
    function(require, loading, dialogHelper,  mainTabsManager) {
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

        function openPartitionDialog(partitionName, view, driveData) {
            loading.show();


            var dlg = dialogHelper.createDialog({
                size: "medium-tall",
                removeOnClose: false,
                scrollY: !0
            });

            dlg.classList.add("formDialog");
            dlg.classList.add("ui-body-a");
            dlg.classList.add("background-theme-a");
            dlg.classList.add("colorChooser");
            dlg.style = "max-width:25%; max-height:42em";


            var d = driveData.find(drive => { return drive.FriendlyName === partitionName }),
                total = Math.round((d.UsedSpace + d.AvailableSpace) / 1073741824.0),
                html = '';

            html += '<div class="formDialogHeader" style="display:flex">';
            html += '<button is="paper-icon-button-light" class="btnCloseDialog autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button>';
            html += '<h3 id="headerContent" class="formDialogHeaderTitle">';
            html += d.FriendlyName; 
            html += '</h3>';
            html += '</div>';

            html += '<div class="formDialogContent scrollY" style="padding:2em; max-height:33em;">';
            html += '<form class="dialogContentInner dialogContentInner-mini ">';

            html += '<h1 id="partitionName">Partition Options</h1>';

            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="notificationAlertThreshold">Notification threshold (Gigabytes)</label>';
            html += '<input type="number" step="1" min="1" max="' + (total) + '" name="notificationAlertThreshold" id="notificationAlertThreshold" class="emby-input"> ';
            html += '<div class="fieldDescription">The limit in gigabytes of free space available on the partition before triggering Embys notification system. Alert users when disk partitions are almost full. </div>';
            html += '<div class="fieldDescription">If the amount of free space is less then the threshold, a notification will be sent.</div>';
            html += '</div>';

            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="aliasPartitionName">Partition Label</label>';
            html += '<input type="text" name="aliasPartitionName" id="aliasPartitionName" class="emby-input"> ';
            html += '<div class="fieldDescription">Choose an friendly name for the partition. If left blank the path for the root will be used.</div>';
            html += '</div>';

            html += '<button id="okButton" is="emby-button" class="raised button-submit block emby-button">Ok</button>';

            html += '</form>';
            html += '</div>';

            dlg.innerHTML = html;

            dlg.querySelector('#notificationAlertThreshold').value = d.Threshold;
            dlg.querySelector('#aliasPartitionName').value = d.Alias;

            dlg.querySelector('#okButton').addEventListener('click',
                async (event) => {
                    event.preventDefault();

                    var config = await ApiClient.getPluginConfiguration(pluginId);

                    var thresholdEntry = {
                        Name     : partitionName,
                        Threshold: dlg.querySelector('#notificationAlertThreshold').value,
                        Alias    : dlg.querySelector('#aliasPartitionName').value
                    }
                    if (config.MonitoredPartitions) {
                        config.MonitoredPartitions = config.MonitoredPartitions.filter((entry) => entry.Name !== partitionName);
                        config.MonitoredPartitions.push(thresholdEntry);
                    } else {
                        config.MonitoredPartitions = [thresholdEntry]
                    }

                    await ApiClient.updatePluginConfiguration(pluginId, config);

                    require([Dashboard.getConfigurationResourceUrl('Chart.js')],
                        async (chart) => {
                            await renderChartData(view, chart);
                            dialogHelper.close(dlg);
                        });
                });

            dlg.querySelector('.btnCloseDialog').addEventListener('click',
                () => {
                    dialogHelper.close(dlg);
                });

            loading.hide();
            dialogHelper.open(dlg);
        }


        function renderDiskSpaceResultChartHtml(driveData, config, chartResultContainer, Chart) {
             
            var usedSpaceColor        = config.UsedColor        ? config.UsedColor        : "#000000";
            var usedSpaceOutline      = config.UsedOutline      ? config.UsedOutline      : "#000000";
            var availableSpaceColor   = config.AvailableColor   ? config.AvailableColor   : "#ffffff";
            var availableSpaceOutline = config.AvailableOutline ? config.AvailableOutline : "#000000";

            var html = '';

            for (var i = 0; i <= driveData.length - 1; i++) {

                if (!driveData[i].IsMonitored) continue;

                html += '<div id="' + driveData[i].FriendlyName + '" class="cardBox visualCardBox diskCardBox" style="padding:1em; max-width:300px">';
                html += '<div class="cardScalable" style="padding:0.6em">';
                html += '<div style="display:flex">';
                html += '<svg style="height: 25px; width: 25px; margin: 1.6em 0; fill:#4CAF50"><use xlink: href="#drive"></use></svg>';
                html += '<h2 class="sectionTitle" style="padding-left:17px">' + driveData[i].Alias + ':</h2>';
                html += '</div>';
                html += '<div class="chart-container" style="position: relative;">';
                html += '<canvas id="drive' + driveData[i].FriendlyName + '" width="275" height="275" style="min-width:275px"></canvas>';
                html += '</div>';
                html += '<p>' + driveData[i].VolumeLabel + " " + driveData[i].FriendlyUsed + "\\" + driveData[i].FriendlyTotal + '</p>';
                html += driveData[i].NotificationEnabled ? '<p>Notification Enabled: ' + driveData[i].Threshold + 'GB threshold</p>' : '';
                html += '</div>';
                html += '</div>';

            }

            chartResultContainer.innerHTML += html;

            for (var t = 0; t <= driveData.length - 1; t++) {
                if (!driveData[t].IsMonitored) continue;
                var ctx = chartResultContainer.querySelector('#drive' + driveData[t].FriendlyName).getContext("2d");

                var myChart = new Chart(ctx,
                    {
                        type : 'doughnut',
                        label: driveData[t].DriveName,
                        data : {
                            labels  : [ 'Used', 'Available' ],
                            datasets: [
                                {
                                    data           : [ driveData[t].UsedSpace, driveData[t].FreeSpace ],
                                    backgroundColor: [ usedSpaceColor, availableSpaceColor ],
                                    borderColor    : [ usedSpaceOutline, availableSpaceOutline ],
                                    borderWidth    : 1,
                                    dataFriendly   : [ driveData[t].FriendlyUsed, driveData[t].FriendlyAvailable ],
                                }
                            ]
                        },
                        options: {

                            cutoutPercentage: config.ChartCutoutPercentage ?? 40,
                            animation: { easing: 'linear' },
                            tooltips: {
                                callbacks: {
                                    title     : (tooltipItem, data) => { return data['labels'][tooltipItem[0]['index']]; },
                                    label     : (tooltipItem, data) => { return data['datasets'][0]['dataFriendly'][tooltipItem['index']]; },
                                    afterLabel: (tooltipItem, data) => {

                                        var dataset = data['datasets'][0];
                                        var total   = dataset['data'][0] + dataset['data'][1];
                                        var percent = Math.round((dataset['data'][tooltipItem['index']] / total) * 100);

                                        return '(' + percent + '%)';

                                    }

                                }
                            }
                        }
                    });
            }
            
        }

        async function renderChartData(view, Chart) {

            var config = await ApiClient.getPluginConfiguration(pluginId);

            var chartRenderContainer = view.querySelector('.diskSpaceChartResultBody');

            chartRenderContainer.innerHTML = '';

            var driveData = await ApiClient.getJSON(ApiClient.getUrl("GetDriveData"));

            var html = '';
            if (driveData.Error) {
                html += '<h1>' + driveData.Error + '</h1>';
                chartRenderContainer.innerHTML = html;
                return;
            }

            renderDiskSpaceResultChartHtml(driveData, config, chartRenderContainer, Chart);

            view.querySelectorAll('.visualCardBox').forEach((button) => {
                button.addEventListener('click',
                    (e) => {
                        openPartitionDialog(e.target.closest('.visualCardBox').id, view, driveData);
                    });
            });
        }

        return function(view) {
            
            view.addEventListener('viewshow',
                async () => {

                    mainTabsManager.setTabs(this, 0, getTabs);

                    const data = await ApiClient.getJSON(ApiClient.getUrl('GetTotalStorage'))
                    view.querySelector('.totalStorage').innerHTML = 'Total Storage: ' + data.Total;

                    require([Dashboard.getConfigurationResourceUrl('Chart.js')],
                        async (chart) => {
                            await renderChartData(view, chart);
                        });

                });
        }
    });