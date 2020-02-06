define(["require", "loading", "dialogHelper", "emby-checkbox", "emby-select"],
    function(require, loading, dialogHelper) {
        var pluginId = "9ECAAC5F-435E-4C21-B1C0-D99423B68984";

        function openDialog(view, Chart) {

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

                html += '<div class="formDialogContent scrollY" style="margin:2em; max-height:33em;">';
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

                html += '<div class="checkboxList paperList checkboxList-paperList">';

                for (var i = 0; i <= driveData.length - 1; i++) {
                    html += getMonitoredPartitionsDialogHtml(driveData[i]);
                }

                html += '</div>';
                 
                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="notificationAlertThreshold">Notification threshold (Gigabytes)</label>';
                html +=
                    '<input type="number" step="1" min="1" name="notificationAlertThreshold" id="notificationAlertThreshold" class="emby-input"> ';
                html +=
                    '<div class="fieldDescription">Threshold when using Embys built-in notification system, to alert an admin when disk partitions are almost full. Default is 10 gigabytes</div>';
                html += '</div>';

                html +=
                    '<button id="okButton" is="emby-button" class="raised button-submit block emby-button">Ok</button>';

                html += '</form>';
                html += '</div>';

                dlg.innerHTML = html;
                

                ApiClient.getPluginConfiguration(pluginId).then((config) => {

                    if (!config.AvailableColor) {
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

                    if (!config.Threshold) {
                        config.Threshold = 10;
                    }

                    dlg.querySelector('#notificationAlertThreshold').value = config.Threshold;


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

                    ApiClient.updatePluginConfiguration(pluginId, config).then(() => {

                    });
                });

                dlg.querySelector('#notificationAlertThreshold').addEventListener('change',
                    () => {
                        ApiClient.getPluginConfiguration(pluginId).then((config) => {
                            config.Threshold = dlg.querySelector('#notificationAlertThreshold').value;
                            ApiClient.updatePluginConfiguration(pluginId, config).then(() => { });
                        });
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
                            config.UsedOutline = dlg.querySelector('#availableSpaceFillColorText').value;
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
                                ApiClient.getPluginConfiguration(pluginId).then((config) => {
                                    config.IgnoredPartitions
                                        ? e.target.checked
                                            ? config.IgnoredPartitions = config.IgnoredPartitions.filter(p => p !== e.target.id)
                                            : config.IgnoredPartitions.push(e.target.id)
                                        : !e.target.checked
                                            ? config.IgnoredPartitions = [e.target.id]
                                            : config.IgnoredPartitions.push(e.target.id);
                                    ApiClient.updatePluginConfiguration(pluginId, config).then((r) => { });
                                });
                            });
                    });

                dlg.querySelector('#okButton').addEventListener('click',
                    (event) => { 
                        event.preventDefault();
                        renderChartAndTableData(view, Chart);
                            dialogHelper.close(dlg);
                      
                    });

                dlg.querySelector('.btnCloseDialog').addEventListener('click',
                    () => {
                        dialogHelper.close(dlg);
                    });

                dialogHelper.open(dlg);
            });
        }

        function getMonitoredPartitionsDialogHtml(driveData) {
            var html = '';
            html += '<div class="listItem  listItem-border  sortableOption">';
            html += '<label class="listItemCheckboxContainer emby-checkbox-label">';
            html += '<input id="' + driveData.FriendlyName + '" type="checkbox" is="emby-checkbox" checked class="chkDiskPartition emby-checkbox" data-embycheckbox="true">';
            html += '<span class="checkboxLabel">' + driveData.FriendlyName + '</span>';
            html += '<span class="emby-checkbox-focushelper"></span>';
            html += '<span class="checkboxOutline">';
            html += '<i class="md-icon checkboxIcon checkboxIcon-checked"></i>';
            html += '<i class="md-icon checkboxIcon checkboxIcon-unchecked"></i>';
            html += '</span>';
            html += '</label>';
            html += '</div>';

            return html;
        }
         
        function getDiskSpaceResultTableHtml(driveData) {
            var html = '';
            driveData.forEach(drive => {
                if (!drive.IsMonitored) continue;
                html += '<tr class="detailTableBodyRow detailTableBodyRow-shaded" id="' + drive.FriendlyName + '">';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell">' + drive.VolumeLabel + '</td>';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell">' + drive.DriveName + '</td>';
                html += '<td data-title="Total Size" class="detailTableBodyCell fileCell">' + drive.FriendlyTotal + '</td>';
                html += '<td data-title="Used" class="detailTableBodyCell fileCell">' + drive.FriendlyUsed + '</td>';
                html += '<td data-title="Available" class="detailTableBodyCell fileCell">' + drive.FriendlyAvailable + '</td>';
                html += '<td data-title="Notifications Enabled" class="detailTableBodyCell fileCell">' + drive.IsMonitored + '</td>';
                var total = drive.UsedSpace + drive.FreeSpace;
                html += '<td data-title="Disk Space" class="detailTableBodyCell fileCell">' + Math.round((drive.FreeSpace / total) * 100) + '%</td>';
                html += '<td class="detailTableBodyCell" style="whitespace:no-wrap;"></td>';
                html += '</tr>';
            });
            return html;
        }

        function renderDiskSpaceResultChartHtml(driveData, config, chartResultContainer, Chart) {
             
            var usedSpaceColor        = config.UsedColor        ? config.UsedColor        : "#000000";
            var usedSpaceOutline      = config.UsedOutline      ? config.UsedOutline      : "#000000";
            var availableSpaceColor   = config.AvailableColor   ? config.AvailableColor   : "#ffffff";
            var availableSpaceOutline = config.AvailableOutline ? config.AvailableOutline : "#000000";

            var html = '';

            for (var i = 0; i <= driveData.length - 1; i++) {

                if (!driveData[i].IsMonitored) continue;

                html += '<div class="cardBox visualCardBox" style="padding:1em;">';
                html += '<div class="cardScalable" style="padding:0.6em">';
                html += '<h2 class="sectionTitle">' + driveData[i].DriveName.substring(0, 5) + '</h2>';
                html += '<div class="chart-container" style="position: relative;">';
                html += '<canvas id="drive' + driveData[i].FriendlyName + '" width="275" height="275"></canvas>';
                html += '</div>';
                html += '<p>' + driveData[i].VolumeLabel + " " + driveData[i].FriendlyUsed + "\\" + driveData[i].FriendlyTotal + '</p>';
                html += '</div>';
                html += '</div>';

            }

            chartResultContainer.innerHTML += html;

            for (var t = 0; t <= driveData.length - 1; t++) {
                if (!driveData[t].IsMonitored) continue;
                var ctx = chartResultContainer.querySelector('#drive' + driveData[t].FriendlyName).getContext("2d");

                var myChart = new Chart(ctx,
                    {
                        type: 'doughnut',
                        label: driveData[t].DriveName,
                        data: {
                            labels: ['Used', 'Available'],
                            datasets: [
                                {
                                    data: [driveData[t].UsedSpace, driveData[t].FreeSpace],
                                    backgroundColor: [usedSpaceColor, availableSpaceColor],
                                    borderColor: [usedSpaceOutline, availableSpaceOutline],
                                    borderWidth: 1,
                                    dataFriendly: [driveData[t].FriendlyUsed, driveData[t].FriendlyAvailable]
                                }
                            ]
                        },
                        options: {
                            "cutoutPercentage": 40,

                            tooltips: {
                                callbacks: {
                                    title: function (tooltipItem, data) {
                                        return data['labels'][tooltipItem[0]['index']];
                                    },
                                    label: function (tooltipItem, data) {
                                        return data['datasets'][0]['dataFriendly'][tooltipItem['index']];
                                    },
                                    afterLabel: function (tooltipItem, data) {
                                        var dataset = data['datasets'][0];
                                        var total = dataset['data'][0] + dataset['data'][1];
                                        var percent = Math.round((dataset['data'][tooltipItem['index']] / total) * 100);
                                        return '(' + percent + '%)';
                                    }

                                },
                                // Disable the on-canvas tooltip
                                //enabled: false 
                            }
                        }
                    });
            }
        }

        function renderChartAndTableData(view, Chart) {
            
                ApiClient.getPluginConfiguration(pluginId).then((config) => {

                    var chartResultContainer = view.querySelector('.diskSpaceChartResultBody');
                    var tableContainer = view.querySelector('.tblPartitionResults');

                    chartResultContainer.innerHTML = '';

                    ApiClient.getJSON(ApiClient.getUrl("GetDriveData")).then((driveData) => {

                        var html = '';
                        if (driveData.Error) {
                            html += '<h1>' + driveData.Error + '</h1>';
                            chartResultContainer.innerHTML = html;
                            return;
                        }

                        renderDiskSpaceResultChartHtml(driveData, config, chartResultContainer, Chart);

                        view.querySelector('.diskSpaceTableResultBody').innerHTML =
                            getDiskSpaceResultTableHtml(driveData);

                        if (config.DataDisplayRender) {
                            if (config.DataDisplayRender === "chart") {

                                if (chartResultContainer.classList.contains('hide'))
                                    chartResultContainer.classList.remove('hide');

                                if (!tableContainer.classList.contains('hide'))
                                    tableContainer.classList.add('hide');

                            } else {

                                if (!chartResultContainer.classList.contains('hide'))
                                    chartResultContainer.classList.add('hide');
                                if (tableContainer.classList.contains('hide'))
                                    tableContainer.classList.remove('hide');

                                view.querySelector('#toggleButton i').innerHTML = 'data_usage';
                            }
                        }
                        
                    });

                });
            
        }

        return function (view) {
            
            view.addEventListener('viewshow',
                () => {

                    var chartContainer = view.querySelector('.diskSpaceChartResultBody');
                    var tableContainer = view.querySelector('.tblPartitionResults');
                    require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                        (chart) => {

                            renderChartAndTableData(view, chart);

                                view.querySelector('#settingsButton').addEventListener('click',
                                    () => {
                                        openDialog(view, chart);
                                    });
                            
                            
                        });
                    //format_list_bulleted
                    //data_usage
                    view.querySelector('#toggleButton').addEventListener('click',
                        (e) => {
                            ApiClient.getPluginConfiguration(pluginId).then((config) => {

                                if (config.DataDisplayRender) {
                                    if (config.DataDisplayRender === "chart") {

                                        if (!chartContainer.classList.contains('hide'))
                                            chartContainer.classList.add('hide');
                                       
                                        if (tableContainer.classList.contains('hide'))
                                            tableContainer.classList.remove('hide');
                                        config.DataDisplayRender = "table";
                                        e.target.classList.contains('md-icon') ? e.target.innerHTML = 'data_usage' : e.target.querySelector('i').innerHTML = 'data_usage';

                                    } else {
                                        if (chartContainer.classList.contains('hide'))
                                            chartContainer.classList.remove('hide');
                                        if (!tableContainer.classList.contains('hide'))
                                            tableContainer.classList.add('hide');
                                        config.DataDisplayRender = "chart";
                                        e.target.classList.contains('md-icon') ? e.target.innerHTML = 'format_list_bulleted' : e.target.querySelector('i').innerHTML = 'format_list_bulleted';
                                    }

                                } else { //We start on rendered Chart Data so switch to table Data

                                    if (!chartContainer.classList.contains('hide'))
                                        chartContainer.classList.add('hide');
                                    if (tableContainer.classList.contains('hide'))
                                        tableContainer.classList.remove('hide');
                                    config.DataDisplayRender = "table";
                                    e.target.classList.contains('md-icon') ? e.target.innerHTML = 'format_list_bulleted' : e.target.querySelector('i').innerHTML = 'format_list_bulleted';
                                }
                                ApiClient.updatePluginConfiguration(pluginId, config).then((r) => { });
                            }); 
                        });
                });
        }
    });