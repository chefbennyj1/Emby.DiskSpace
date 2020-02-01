﻿define(["require", "loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(require, loading, dialogHelper) {
        var pluginId = "9ECAAC5F-435E-4C21-B1C0-D99423B68984";

        function openDialog(view, Chart) {


            ApiClient.getJSON(ApiClient.getUrl("GetDriveData")).then((driveData) => {

                var monitoredPartitions = [];
                var dlg = dialogHelper.createDialog({
                    size: "medium-tall",
                    removeOnClose: !0,
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
                    '<input is="emby-input" type="color" name="availableSpaceFillColor" id="availableSpaceFillColor" label="Available space fill color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input is="emby-input" type="text" name="availableSpaceFillColorText" id="availableSpaceFillColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart fill color for available disk space.</div>';
                html += '</div>';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="availableSpaceOutlineColor">Available space outline</label>';
                html +=
                    '<input is="emby-input" type="color" name="availableSpaceOutlineColor" id="availableSpaceOutlineColor" label="Available space outline color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input is="emby-input" type="text" name="availableSpaceFillColorText" id="availableSpaceOutlineColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart outline color for available disk space.</div>';
                html += '</div>';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="usedSpaceFillColor">Used space fill color</label>';
                html +=
                    '<input is="emby-input" type="color" name="usedSpaceFillColor" id="usedSpaceFillColor" label="Used space fill color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input is="emby-input" type="text" name="usedSpaceFillColorText" id="usedSpaceFillColorText" class="emby-input"> ';
                html += '<div class="fieldDescription">Chart fill color for used disk space.</div>';
                html += '</div>';


                html += '<div class="inputContainer">';
                html +=
                    '<label class="inputLabel inputLabelUnfocused" for="usedSpaceOutlineColor">Used space outline color</label>';
                html +=
                    '<input is="emby-input" type="color" name="usedSpaceOutlineColor" id="usedSpaceOutlineColor" label="Used space outline color" class="emby-input" style="height:2em"> ';

                html +=
                    '<input is="emby-input" type="text" name="usedSpaceOutlineColorText" id="usedSpaceOutlineColorText" class="emby-input"> ';
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
                    '<input is="emby-input" type="number" step="1" min="1" name="notificationAlertThreshold" id="notificationAlertThreshold" class="emby-input"> ';
                html +=
                    '<div class="fieldDescription">Threshold when using Embys built-in notification system, to alert an admin when disk partitions are almost full. Default is 10 gigabytes</div>';
                html += '</div>';

                html +=
                    '<button id="okButton" is="emby-button" type="submit" class="raised button-submit block emby-button">Ok</button>';

                html += '</form>';
                html += '</div>';

                dlg.innerHTML = html;
                dialogHelper.open(dlg);
                ApiClient.getPluginConfiguration(pluginId).then((config) => {

                    if (config.AvailableColor) {
                        dlg.querySelector('#availableSpaceFillColorText').value = config.AvailableColor;
                        dlg.querySelector('#availableSpaceOutlineColorText').value = config.AvailableOutline;
                        dlg.querySelector('#usedSpaceFillColorText').value = config.UsedColor;
                        dlg.querySelector('#usedSpaceOutlineColorText').value = config.UsedOutline;

                        dlg.querySelector('#availableSpaceFillColor').value = config.AvailableColor;
                        dlg.querySelector('#availableSpaceOutlineColor').value = config.AvailableOutline;
                        dlg.querySelector('#usedSpaceFillColor').value = config.UsedColor;
                        dlg.querySelector('#usedSpaceOutlineColor').value = config.UsedOutline;

                    }

                    if (config.Threshold) {
                        dlg.querySelector('#notificationAlertThreshold').value = config.Threshold || 10;
                    } else {
                        dlg.querySelector('#notificationAlertThreshold').value = 10;
                    }

                    if (config.MonitoredPartitions) {
                        monitoredPartitions = config.MonitoredPartitions;
                        config.MonitoredPartitions.forEach((monitoredPartition) => {
                            dlg.querySelector("#" + monitoredPartition.Name).checked = monitoredPartition.Monitored;
                        });
                    }

                    dlg.querySelectorAll('input[type=checkbox]').forEach((box) => {
                        box.addEventListener('change',
                            (e) => {
                                var newPartition = {
                                    Name: e.target.id,
                                    Monitored : e.target.checked
                                }
                                
                                if (monitoredPartitions.length) {
                                    monitoredPartitions = monitoredPartitions.filter(item => item.Name !== newPartition.Name); 
                                }
                                monitoredPartitions.push(newPartition);
                            });
                    });


                    dlg.querySelector('#availableSpaceFillColor').addEventListener('change',
                        () => {
                            dlg.querySelector('#availableSpaceFillColorText').value =
                                dlg.querySelector('#availableSpaceFillColor').value;
                        });

                    dlg.querySelector('#availableSpaceOutlineColor').addEventListener('change',
                        () => {
                            dlg.querySelector('#availableSpaceOutlineColorText').value =
                                dlg.querySelector('#availableSpaceOutlineColor').value;
                        });

                    dlg.querySelector('#usedSpaceFillColor').addEventListener('change',
                        () => {
                            dlg.querySelector('#usedSpaceFillColorText').value =
                                dlg.querySelector('#usedSpaceFillColor').value;
                        });

                    dlg.querySelector('#usedSpaceOutlineColor').addEventListener('change',
                        () => {
                            dlg.querySelector('#usedSpaceOutlineColorText').value =
                                dlg.querySelector('#usedSpaceOutlineColor').value;
                        });

                    dlg.querySelector('#okButton').addEventListener('click',
                        () => {
                               
                            var update = {
                                AvailableColor: dlg.querySelector('#availableSpaceFillColorText').value,
                                AvailableOutline: dlg.querySelector('#availableSpaceOutlineColorText').value,
                                UsedColor: dlg.querySelector('#usedSpaceFillColorText').value,
                                UsedOutline: dlg.querySelector('#usedSpaceOutlineColorText').value,
                                Threshold: dlg.querySelector('#notificationAlertThreshold').value !== ""
                                    ? dlg.querySelector('#notificationAlertThreshold').value
                                    : 10,
                                MonitoredPartitions: monitoredPartitions
                            }

                            ApiClient.updatePluginConfiguration(pluginId, update).then(r => {
                                Dashboard.processPluginConfigurationUpdateResult(r);
                                drawDriveChart(view, Chart);
                                dialogHelper.close(dlg);
                            });

                        });

                    dlg.querySelector('.btnCloseDialog').addEventListener('click',
                        () => {
                            dialogHelper.close(dlg);
                        });

                });

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
            });
        }
        
        function drawDriveChart(view, Chart) {

            var drivesContainer = view.querySelector('#drivesContainer');

            ApiClient.getPluginConfiguration(pluginId).then((config) => {

                var usedSpaceColor        = config.UsedColor        ? config.UsedColor        : "#000";
                var usedSpaceOutline      = config.UsedOutline      ? config.UsedOutline      : "#000";
                var availableSpaceColor   = config.AvailableColor   ? config.AvailableColor   : "#fff";
                var availableSpaceOutline = config.AvailableOutline ? config.AvailableOutline : "#fff";

                drivesContainer.innerHTML = '';

                var html = '';

                ApiClient.getJSON(ApiClient.getUrl("GetDriveData")).then((driveData) => {

                    if (driveData.Error) {
                        html += '<h1>' + driveData.Error + '</h1>';
                        drivesContainer.innerHTML = html;
                        return;
                    }

                    for (var i = 0; i <= driveData.length - 1; i++) {
                        if (!driveData[i].IsMonitored) continue;
                        html += '<div class="cardBox visualCardBox" style="padding:1em;">';
                        html += '<div class="cardScalable" style="padding:0.6em">';
                        html += '<h2 class="sectionTitle">' + driveData[i].DriveName + '</h2>';
                        html += '<div class="chart-container" style="position: relative;">';
                        html += '<canvas id="drive' + driveData[i].FriendlyName + '" width="275" height="275"></canvas>';
                        html += '</div>';
                        html += '<p>' + driveData[i].VolumeLabel + " - " + driveData[i].FriendlyUsed + "\\" + driveData[i].FriendlyTotal + '</p>';
                        html += '</div>';
                        html += '</div>';
                    }

                    drivesContainer.innerHTML += html;

                    for (var t = 0; t <= driveData.length - 1; t++) {
                        if (!driveData[t].IsMonitored) continue;
                        var ctx = drivesContainer.querySelector('#drive' + driveData[t].FriendlyName).getContext("2d");
                           
                        var myChart = new Chart(ctx,
                            {
                                type: 'doughnut',
                                label: driveData[t].DriveName,
                                data: {
                                    labels   : ['Used', 'Available'],
                                    datasets : [
                                        {
                                            data            : [ driveData[t].UsedSpace, driveData[t].FreeSpace ],
                                            backgroundColor : [ usedSpaceColor, availableSpaceColor ],
                                            borderColor     : [ usedSpaceOutline, availableSpaceOutline ],
                                            borderWidth: 1,
                                            dataFriendly    : [ driveData[t].FriendlyUsed, driveData[t].FriendlyAvailable ]
                                        }
                                    ]
                                },
                                options: {
                                    "cutoutPercentage" : 40,
                                    
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
                });
            });

        }

        return function (view) {
            
            view.addEventListener('viewshow',
                () => {
                    
                    require([Dashboard.getConfigurationResourceUrl('Chart.bundle.js')],
                        (chart) => {

                            drawDriveChart(view, chart);
                            view.querySelector('#settingsButton').addEventListener('click',
                                () => {
                                    openDialog(view, chart);
                                });
                        });
                });
        }
    });