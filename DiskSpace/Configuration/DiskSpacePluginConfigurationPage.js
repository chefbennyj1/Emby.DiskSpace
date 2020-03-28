define(["require", "loading", "dialogHelper", "formDialogStyle", "emby-checkbox", "emby-select", "emby-toggle"],
    function(require, loading, dialogHelper) {
        var pluginId = "9ECAAC5F-435E-4C21-B1C0-D99423B68984";

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
                (event) => {
                    event.preventDefault();
                    ApiClient.getPluginConfiguration(pluginId).then((config) => {
                        var thresholdEntry = {
                            Name: partitionName,
                            Threshold: dlg.querySelector('#notificationAlertThreshold').value,
                            Alias: dlg.querySelector('#aliasPartitionName').value
                                
                    }
                        if (config.MonitoredPartitions) {
                            config.MonitoredPartitions = config.MonitoredPartitions.filter((entry) => entry.Name !== partitionName);
                            config.MonitoredPartitions.push(thresholdEntry);
                        } else {
                            config.MonitoredPartitions = [thresholdEntry]
                        }
                        ApiClient.updatePluginConfiguration(pluginId, config).then(() => {
                            require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                                (chart) => {
                                    renderChartAndTableData(view, chart);
                                    dialogHelper.close(dlg);
                                });
                        });
                    });
                });

            dlg.querySelector('.btnCloseDialog').addEventListener('click',
                () => {
                    dialogHelper.close(dlg);
                });

            loading.hide();
            dialogHelper.open(dlg);
        }
         
        function openSettingsDialog(view) {

            loading.show();
            ApiClient.getJSON(ApiClient.getUrl("GetDriveData")).then((driveData) => {

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

                var html = '';
                html += '<div class="formDialogHeader" style="display:flex">';
                html +=
                    '<button is="paper-icon-button-light" class="btnCloseDialog autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button><h3 id="headerContent" class="formDialogHeaderTitle">Color</h3>';
                html += '</div>';

                html += '<div class="formDialogContent scrollY" style="padding:2em; max-height:33em;">';
                html += '<form class="dialogContentInner dialogContentInner-mini ">';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="availableSpaceFillColor">Available space fill color</label>';
                html +=
                    '<input type="color" name="availableSpaceFillColor" id="availableSpaceFillColor" label="Available space fill color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input type="text" name="availableSpaceFillColorText" id="availableSpaceFillColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart fill color for available disk space.</div>';
                html += '</div>'; 

                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="availableSpaceOutlineColor">Available space outline</label>';
                html +=
                    '<input type="color" name="availableSpaceOutlineColor" id="availableSpaceOutlineColor" label="Available space outline color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input type="text" name="availableSpaceFillColorText" id="availableSpaceOutlineColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart outline color for available disk space.</div>';
                html += '</div>';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="usedSpaceFillColor">Used space fill color</label>';
                html +=
                    '<input type="color" name="usedSpaceFillColor" id="usedSpaceFillColor" label="Used space fill color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input type="text" name="usedSpaceFillColorText" id="usedSpaceFillColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart fill color for used disk space.</div>';
                html += '</div>';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="usedSpaceOutlineColor">Used space outline color</label>';
                html +=
                    '<input type="color" name="usedSpaceOutlineColor" id="usedSpaceOutlineColor" label="Used space outline color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input type="text" name="usedSpaceOutlineColorText" id="usedSpaceOutlineColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart outline color for used disk space.</div>';
                html += '</div>';

                html += '<div class="paperList" style="margin:2em;padding:2em">';
                html += '<h2>Active Partitions</h2>';
                for (var i = 0; i <= driveData.length - 1; i++) {
                    html += getMonitoredPartitionsDialogHtml(driveData[i]);
                }

                html += '</div>';

                /*
                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="notificationAlertThreshold">Notification threshold (Gigabytes)</label>';
                
                html +=
                    '<input type="number" step="1" min="1" name="notificationAlertThreshold" id="notificationAlertThreshold" class="emby-input"> ';
                html +=
                    '<div class="fieldDescription">Threshold when using Embys built-in notification system, to alert an admin when disk partitions are almost full. Default is 10 gigabytes</div>';
                html += '</div>';
                */

                html +=
                    '<button id="okButton" is="emby-button" class="raised button-submit block emby-button">Ok</button>';

                html += '</form>';
                html += '</div>';

                dlg.innerHTML = html;
                

                ApiClient.getPluginConfiguration(pluginId).then((config) => {

                    if (!config.AvailableColor) {   //default to black and white
                        config.AvailableColor   = '#ffffff';
                        config.AvailableOutline = '#000000';
                        config.UsedColor        = '#000000';
                        config.UsedOutline      = '#000000';
                    }

                    dlg.querySelector('#availableSpaceFillColorText').value    = config.AvailableColor;
                    dlg.querySelector('#availableSpaceOutlineColorText').value = config.AvailableOutline;
                    dlg.querySelector('#usedSpaceFillColorText').value         = config.UsedColor;
                    dlg.querySelector('#usedSpaceOutlineColorText').value      = config.UsedOutline;

                    dlg.querySelector('#availableSpaceFillColor').value        = config.AvailableColor;
                    dlg.querySelector('#availableSpaceOutlineColor').value     = config.AvailableOutline;
                    dlg.querySelector('#usedSpaceFillColor').value             = config.UsedColor;
                    dlg.querySelector('#usedSpaceOutlineColor').value          = config.UsedOutline;

                    
                    driveData.forEach((drive) => {
                        if (config.IgnoredPartitions) {
                            if (config.IgnoredPartitions.includes(drive.FriendlyName)) {

                                dlg.querySelector('#' + drive.FriendlyName).checked = false;

                            } else {

                                dlg.querySelector('#' + drive.FriendlyName).checked = true;
                            }
                        } else {

                            dlg.querySelector('#' + drive.FriendlyName).checked = true;
                        }
                    });

                    ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                });

                
                dlg.querySelector('#availableSpaceFillColor').addEventListener('change',
                    () => {
                        dlg.querySelector('#availableSpaceFillColorText').value =
                            dlg.querySelector('#availableSpaceFillColor').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.AvailableColor = dlg.querySelector('#availableSpaceFillColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });

                dlg.querySelector('#availableSpaceOutlineColor').addEventListener('change',
                    () => {
                        dlg.querySelector('#availableSpaceOutlineColorText').value =
                            dlg.querySelector('#availableSpaceOutlineColor').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.AvailableOutline = dlg.querySelector('#availableSpaceOutlineColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });

                    });

                dlg.querySelector('#usedSpaceFillColor').addEventListener('change',
                    () => {
                        dlg.querySelector('#usedSpaceFillColorText').value =
                            dlg.querySelector('#usedSpaceFillColor').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.UsedColor = dlg.querySelector('#usedSpaceFillColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });

                    });

                dlg.querySelector('#usedSpaceOutlineColor').addEventListener('change',
                    () => {
                        dlg.querySelector('#usedSpaceOutlineColorText').value =
                            dlg.querySelector('#usedSpaceOutlineColor').value;

                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.UsedOutline = dlg.querySelector('#usedSpaceOutlineColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });

                //Switch Text box entries

                dlg.querySelector('#availableSpaceFillColorText').addEventListener('input',
                    () => {
                        dlg.querySelector('#availableSpaceFillColor').value =
                            dlg.querySelector('#availableSpaceFillColorText').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.AvailableColor = dlg.querySelector('#availableSpaceFillColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });

                dlg.querySelector('#availableSpaceOutlineColorText').addEventListener('input',
                    () => {
                        dlg.querySelector('#availableSpaceOutlineColor').value =
                            dlg.querySelector('#availableSpaceOutlineColorText').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.AvailableOutline = dlg.querySelector('#availableSpaceOutlineColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });

                dlg.querySelector('#usedSpaceFillColorText').addEventListener('input',
                    () => {
                        dlg.querySelector('#usedSpaceFillColor').value =
                            dlg.querySelector('#usedSpaceFillColorText').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.UsedColor = dlg.querySelector('#usedSpaceFillColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });

                dlg.querySelector('#usedSpaceOutlineColorText').addEventListener('input',
                    () => {
                        dlg.querySelector('#usedSpaceOutlineColor').value =
                            dlg.querySelector('#usedSpaceOutlineColorText').value;
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.UsedOutline = dlg.querySelector('#usedSpaceOutlineColorText').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                            
                        });
                    });


                dlg.querySelectorAll('input[type=checkbox]').forEach(
                    (checkbox) => {
                        checkbox.addEventListener('change',
                            (e) => {
                                loading.show();
                                ApiClient.getPluginConfiguration(pluginId).then((config) => {
                                    
                                    config.IgnoredPartitions
                                        ? e.target.checked
                                            ? config.IgnoredPartitions = config.IgnoredPartitions.filter(p => p !== e.target.id)
                                            : config.IgnoredPartitions.push(e.target.id)   //<-- we'll never get here
                                        : !e.target.checked
                                            ? config.IgnoredPartitions = [e.target.id]
                                            : config.IgnoredPartitions.push(e.target.id); //<-- we'll never get here

                                    //Remove any saved monitored partitionThresholds
                                    if (config.MonitoredPartitions) {
                                        if (config.MonitoredPartitions.filter((entry) => entry.Name === e.target.id).length == 0)
                                            config.MonitoredPartitions = config.MonitoredPartitions.filter((entry) => entry.Name !== e.target.id) 
                                    } 

                                    ApiClient.updatePluginConfiguration(pluginId, config).then((r) => {

                                        loading.hide();

                                    });
                                });
                            });
                    });

                dlg.querySelector('#okButton').addEventListener('click',
                    (event) => {
                        event.preventDefault();
                        require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                            (chart) => {
                                renderChartAndTableData(view, chart);
                                dialogHelper.close(dlg);
                            });
                    });

                dlg.querySelector('.btnCloseDialog').addEventListener('click',
                    () => {
                        dialogHelper.close(dlg);
                    });
                loading.hide();
                dialogHelper.open(dlg);
                
            });
        }

        function getMonitoredPartitionsDialogHtml(driveData) {
            var html = '';
            html += '<div class="inputContainer">';
            html += '<label style="width: auto;" class="mdl-switch mdl-js-switch">';
            html += '<input is="emby-toggle" type="checkbox" id="' + driveData.FriendlyName + '"  class="chkDiskPartition noautofocus mdl-switch__input" data-embytoggle="true">';
            html += '<span class="toggleButtonLabel mdl-switch__label">' + driveData.FriendlyName + '</span>';
            html += '<div class="mdl-switch__trackContainer">';
            html += '<div class="mdl-switch__track"></div>';
            html += '<div class="mdl-switch__thumb">';
            html += '<span class="mdl-switch__focus-helper"></span>';
            html += '</div>';
            html += '</div>';
            html += '</label>'; 
            html += '</div>';

            return html;
        }
         
        function getDiskSpaceResultTableHtml(driveData) {
            var html = '';

            driveData.forEach(drive => {

                if (!drive.IsMonitored) return;

                var total          = drive.UsedSpace + drive.FreeSpace;
                var thresholdColor = getThresholdExceededColor(drive.Threshold, drive.FreeSpace);

                html += '<tr class="detailTableBodyRow detailTableBodyRow-shaded" id="' + drive.FriendlyName + '">';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell"' + thresholdColor + '>';
                html += '<svg style="height: 25px; width: 25px; margin: 0.6em 0.9em; fill:#4CAF50"><use xlink: href="#'   + getDriveIconSvgHtml(drive.Threshold, drive.FreeSpace) + '"></use></svg></td> ';

                html += '<td data-title="Name" class="detailTableBodyCell fileCell"'                         + thresholdColor + '>' + drive.Alias + '</td>';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell-shaded"'                  + thresholdColor + '>' + drive.VolumeLabel + '</td>';
                html += '<td data-title="Total Size" class="detailTableBodyCell fileCell"'                   + thresholdColor + '>' + drive.FriendlyTotal + '</td>';
                html += '<td data-title="Used" class="detailTableBodyCell fileCell-shaded"'                  + thresholdColor + '>' + drive.FriendlyUsed + '</td>';
                html += '<td data-title="Available" class="detailTableBodyCell fileCell"'                    + thresholdColor + '>' + drive.FriendlyAvailable + '</td>';
                html += '<td data-title="Notifications Enabled" class="detailTableBodyCell fileCell-shaded"' + thresholdColor + '>' + drive.NotificationEnabled + '</td>';
                html += '<td data-title="Notification Threshold" class="detailTableBodyCell fileCell"'       + thresholdColor + '>' + (drive.Threshold ? drive.Threshold + 'GB' : 'unset') + '</td>';
                html += '<td data-title="Disk Space" class="detailTableBodyCell fileCell"'                   + thresholdColor + '>' + Math.round((drive.FreeSpace / total) * 100) + '%</td>';

                html += '<td class="detailTableBodyCell fileCell">';

                html += '<div id="' + drive.FriendlyName + '" class="partitionOptions emby-button"><i class="md-icon">more_horiz</i></div></td>';
                html += '<td class="detailTableBodyCell" style="whitespace:no-wrap;"></td>';
                html += '</tr>';

            });

            return html;


        }

        
        function getDriveIconSvgHtml(threshold, freespace) {
            return threshold ? (freespace / 1073741824.0) < threshold
                ? 'driveFull'
                : 'drive'
                : 'drive';
        }

        function getThresholdExceededColor(threshold, freespace) {
            return threshold ? (freespace / 1073741824.0) <  threshold ? ' style="color:orangered;"' : '' : '';
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
                html += '<h2 class="sectionTitle">' + driveData[i].Alias + '</h2>';
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
                                    dataFriendly   : [ driveData[t].FriendlyUsed, driveData[t].FriendlyAvailable ]
                                }
                            ]
                        },
                        options: {

                            "cutoutPercentage": 40,

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

        function renderChartAndTableData(view, Chart) {
           
            ApiClient.getPluginConfiguration(pluginId).then((config) => {

                var chartRenderContainer = view.querySelector('.diskSpaceChartResultBody');
                var tableContainer       = view.querySelector('.tblPartitionResults');

                chartRenderContainer.innerHTML = '';

                ApiClient.getJSON(ApiClient.getUrl("GetDriveData")).then((driveData) => {

                    var html = '';
                    if (driveData.Error) {
                        html += '<h1>' + driveData.Error + '</h1>';
                        chartRenderContainer.innerHTML = html;
                        return;
                    }

                    renderDiskSpaceResultChartHtml(driveData, config, chartRenderContainer, Chart);

                    view.querySelector('.diskSpaceTableResultBody').innerHTML =
                        getDiskSpaceResultTableHtml(driveData);
                    
                    if (config.DataDisplayRender) {
                        if (config.DataDisplayRender === "chart") {

                            if (chartRenderContainer.classList.contains('hide'))
                                chartRenderContainer.classList.remove('hide');

                            if (!tableContainer.classList.contains('hide'))
                                tableContainer.classList.add('hide');

                        } else {

                            if (!chartRenderContainer.classList.contains('hide'))
                                chartRenderContainer.classList.add('hide');

                            if (tableContainer.classList.contains('hide'))
                                tableContainer.classList.remove('hide');

                            view.querySelector('#toggleButton i').innerHTML = 'data_usage';
                        }

                    }

                    view.querySelectorAll('.visualCardBox').forEach((button) => {
                        button.addEventListener('click',
                            (e) => {
                                openPartitionDialog(e.target.closest('.visualCardBox').id, view, driveData);
                            });
                    });

                    view.querySelectorAll('.partitionOptions').forEach((button) => {
                        button.addEventListener('click',
                            (e) => {
                                openPartitionDialog(e.target.closest('.partitionOptions').id, view, driveData);
                            });
                    });

                    /*
                    view.querySelectorAll('.diskCardBox').forEach((card) => {
                        card.addEventListener('mouseenter',
                            (e) => {
                                e.target.lastElementChild.style = "opacity:1";
                            });
                        card.addEventListener('mouseleave',
                            (e) => {
                                e.target.lastElementChild.style = "opacity:0";
                            });

                    });
                    */
                });

            });

        }

        return function(view) {
            
            view.addEventListener('viewshow',
                () => {

                    ApiClient.getJSON(ApiClient.getUrl('GetTotalStorage')).then((data) => {
                        view.querySelector('.totalStorage').innerHTML = 'Total Storage: ' + data.Total;
                    });

                    var chartContainer = view.querySelector('.diskSpaceChartResultBody');
                    var tableContainer = view.querySelector('.tblPartitionResults');

                    require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                        (chart) => {

                            renderChartAndTableData(view, chart);

                                view.querySelector('#settingsButton').addEventListener('click',
                                    () => {
                                        openSettingsDialog(view);
                                    });

                        });

                    //format_list_bulleted
                    //data_usage
                    view.querySelector('#toggleButton').addEventListener('click',
                        (e) => {
                            e.preventDefault();
                            ApiClient.getPluginConfiguration(pluginId).then((config) => {

                                if (config.DataDisplayRender) {

                                    switch (config.DataDisplayRender) {

                                        case 'chart':   //switch to table view

                                            if (!chartContainer.classList.contains('hide'))
                                                chartContainer.classList.add('hide');

                                            if (tableContainer.classList.contains('hide'))
                                                tableContainer.classList.remove('hide');

                                            config.DataDisplayRender = "table";
                                            e.target.classList.contains('md-icon')
                                                ? e.target.innerHTML = 'data_usage'
                                                : e.target.querySelector('i').innerHTML = 'data_usage';

                                            ApiClient.updatePluginConfiguration(pluginId, config).then((r) => { });
                                            break;

                                        case 'table':  //switch to chart view

                                            if (chartContainer.classList.contains('hide'))
                                                chartContainer.classList.remove('hide');

                                            if (!tableContainer.classList.contains('hide'))
                                                tableContainer.classList.add('hide');

                                            config.DataDisplayRender = "chart";
                                            e.target.classList.contains('md-icon')
                                                ? e.target.innerHTML = 'format_list_bulleted'
                                                : e.target.querySelector('i').innerHTML = 'format_list_bulleted';

                                            require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                                                (chart) => {
                                                    ApiClient.updatePluginConfiguration(pluginId, config).then((r) => {
                                                        renderChartAndTableData(view, chart);
                                                    });

                                                });

                                            break;
                                    }
                                    

                                } else { //We start on rendered Chart Data so switch to table Data

                                    if (!chartContainer.classList.contains('hide'))
                                        chartContainer.classList.add('hide');

                                    if (tableContainer.classList.contains('hide'))
                                        tableContainer.classList.remove('hide');

                                    config.DataDisplayRender = "table";
                                    e.target.classList.contains('md-icon') ? e.target.innerHTML = 'format_list_bulleted' : e.target.querySelector('i').innerHTML = 'format_list_bulleted';
                                    ApiClient.updatePluginConfiguration(pluginId, config).then((r) => { });
                                }
                                
                            }); 
                        });

                   
                });
        }
    });