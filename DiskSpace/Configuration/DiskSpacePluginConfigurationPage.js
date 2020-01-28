define(["require", "loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(require, loading, dialogHelper) {
        var pluginId = "9ECAAC5F-435E-4C21-B1C0-D99423B68984";

        function openDialog(view, Chart) {
            var dlg = dialogHelper.createDialog({
                size          : "medium-tall",
                removeOnClose : !0,
                scrollY       : !1
            });

            dlg.classList.add("formDialog");
            dlg.classList.add("ui-body-a");
            dlg.classList.add("background-theme-a");
            dlg.classList.add("colorChooser");
            dlg.style = "max-width:25%;";

            var html = '';
            html += '<div class="formDialogHeader" style="display:flex">';
            html += '<button is="paper-icon-button-light" class="btnCloseDialog autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button><h3 id="headerContent" class="formDialogHeaderTitle">Color</h3>';
            html += '</div>';

            html += '<div class="formDialogContent" style="margin:2em;">';
            html += '<form class="dialogContentInner dialog-content-centered dialogContentInner-mini">';


            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="availableSpaceFillColor">Available space fill color</label>';
            html += '<input is="emby-input" type="color" name="availableSpaceFillColor" id="availableSpaceFillColor" label="Available space fill color" class="emby-input" style="height:2em"> ';
           
            html += '<input is="emby-input" type="text" name="availableSpaceFillColorText" id="availableSpaceFillColorText" class="emby-input"> ';
            html += '<div class="fieldDescription">Chart fill color for available disk space.</div>';
            html += '</div>';


            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="availableSpaceOutlineColor">Available space outline</label>';
            html += '<input is="emby-input" type="color" name="availableSpaceOutlineColor" id="availableSpaceOutlineColor" label="Available space outline color" class="emby-input" style="height:2em"> ';

            html += '<input is="emby-input" type="text" name="availableSpaceFillColorText" id="availableSpaceOutlineColorText" class="emby-input"> ';
            html += '<div class="fieldDescription">Chart outline color for available disk space.</div>';
            html += '</div>';


            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="usedSpaceFillColor">Used space fill color</label>';
            html += '<input is="emby-input" type="color" name="usedSpaceFillColor" id="usedSpaceFillColor" label="Used space fill color" class="emby-input" style="height:2em"> ';

            html += '<input is="emby-input" type="text" name="usedSpaceFillColorText" id="usedSpaceFillColorText" class="emby-input"> ';
            html += '<div class="fieldDescription">Chart fill color for used disk space.</div>';
            html += '</div>';


            html += '<div class="inputContainer">';
            html += '<label class="inputLabel inputLabelUnfocused" for="usedSpaceOutlineColor">Used space outline color</label>';
            html += '<input is="emby-input" type="color" name="usedSpaceOutlineColor" id="usedSpaceOutlineColor" label="Used space outline color" class="emby-input" style="height:2em"> ';

            html += '<input is="emby-input" type="text" name="usedSpaceOutlineColorText" id="usedSpaceOutlineColorText" class="emby-input"> ';
            html += '<div class="fieldDescription">Chart outline color for used disk space.</div>';
            html += '</div>';
           
            html += '<div class="formDialogFooter" style="padding-top:2em">';
            html += '<button id="okButton" is="emby-button" type="submit" class="raised button-submit block formDialogFooterItem emby-button">Ok</button>';
            html += '</div>';

            html += '</form>';
            html += '</div>';

            dlg.innerHTML = html;
            dialogHelper.open(dlg);
            ApiClient.getPluginConfiguration(pluginId).then((config) => {

                if (config.AvailableColor) {
                    dlg.querySelector('#availableSpaceFillColorText').value    = config.AvailableColor;
                    dlg.querySelector('#availableSpaceOutlineColorText').value = config.AvailableOutline;
                    dlg.querySelector('#usedSpaceFillColorText').value         = config.UsedColor;
                    dlg.querySelector('#usedSpaceOutlineColorText').value      = config.UsedOutline;

                    dlg.querySelector('#availableSpaceFillColor').value        = config.AvailableColor;
                    dlg.querySelector('#availableSpaceOutlineColor').value     = config.AvailableOutline;
                    dlg.querySelector('#usedSpaceFillColor').value             = config.UsedColor;
                    dlg.querySelector('#usedSpaceOutlineColor').value          = config.UsedOutline;
                    
                }

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
                            AvailableColor   : dlg.querySelector('#availableSpaceFillColorText').value,
                            AvailableOutline : dlg.querySelector('#availableSpaceOutlineColorText').value,
                            UsedColor        : dlg.querySelector('#usedSpaceFillColorText').value,
                            UsedOutline      : dlg.querySelector('#usedSpaceOutlineColorText').value,
                            
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

                        var ctx = drivesContainer.querySelector('#drive' + driveData[t].FriendlyName).getContext("2d");

                        var usedSpaceFriendly      = driveData[t].FriendlyUsed;
                        var availableSpaceFriendly = driveData[t].FriendlyAvailable;
                        
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
                                            borderWidth     : 1
                                        }
                                    ]
                                },
                                options: {
                                    "cutoutPercentage" : 40,
                                    legend : {
                                        onClick : () => {
                                            openDialog(view, Chart);
                                        }
                                    },
                                    tooltips: {
                                        callbacks: {
                                            title: function (tooltipItem, data) {
                                                return data['labels'][tooltipItem[0]['index']];
                                            },
                                            label: function (tooltipItem, data) {
                                                return data['datasets'][0]['data'][tooltipItem['index']];
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
                            
                        });
                });
        }
    });