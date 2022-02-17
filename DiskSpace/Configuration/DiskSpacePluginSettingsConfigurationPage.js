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

        function getMonitoredPartitionsDialogHtml(driveData) {
            var html = '';
            html += '<div class="inputContainer" style="margin-right:6em">';

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

        return function (view) {

            view.addEventListener('viewshow',
                async () => {

                    mainTabsManager.setTabs(this, 3, getTabs);

                    var driveData = await ApiClient.getJSON(ApiClient.getUrl("GetDriveData"));

                   
                    if (driveData.Error) {
                        //html += '<h1>' + driveData.Error + '</h1>';
                        //chartRenderContainer.innerHTML = html;
                        return;
                    }

                    var html = '';
                    
                    for (let i = 0; i <= driveData.length - 1; i++) {
                        html += getMonitoredPartitionsDialogHtml(driveData[i]);
                    }

                    view.querySelector('.partitionContainer').innerHTML = html;

                    var config = await ApiClient.getPluginConfiguration(pluginId);

                    view.querySelectorAll('input[type=checkbox]').forEach(
                        (checkbox) => {
                            checkbox.addEventListener('change',
                                async (e) => {
                                    loading.show();
                                    
                                    config = await ApiClient.getPluginConfiguration(pluginId);

                                    config.IgnoredPartitions
                                        ? e.target.checked
                                            ? config.IgnoredPartitions = config.IgnoredPartitions.filter(p => p !== e.target.id)
                                            : config.IgnoredPartitions.push(e.target.id)   //<-- we'll never get here
                                        : !e.target.checked
                                            ? config.IgnoredPartitions = [e.target.id]
                                            : config.IgnoredPartitions.push(e.target.id); //<-- we'll never get here

                                    //Remove any saved monitored partitionThresholds
                                    if (config.MonitoredPartitions) {
                                        if (config.MonitoredPartitions.filter((entry) => entry.Name === e.target.id).length == 0);
                                        config.MonitoredPartitions =
                                            config.MonitoredPartitions.filter(
                                                (entry) => entry.Name !== e.target.id);
                                    }

                                    await ApiClient.updatePluginConfiguration(pluginId, config)

                                    loading.hide();
                                });
                        });

                    if (!config.AvailableColor) {   //default to black and white
                        config.AvailableColor = '#ffffff';
                        config.AvailableOutline = '#000000';
                        config.UsedColor = '#000000';
                        config.UsedOutline = '#000000';
                    }

                    view.querySelector('#driveChartCutoutPercentage').value     = config.ChartCutoutPercentage ?? 40;

                    view.querySelector('#availableSpaceFillColorText').value    = config.AvailableColor;
                    view.querySelector('#availableSpaceOutlineColorText').value = config.AvailableOutline;
                    view.querySelector('#usedSpaceFillColorText').value         = config.UsedColor;
                    view.querySelector('#usedSpaceOutlineColorText').value      = config.UsedOutline;

                    view.querySelector('#availableSpaceFillColor').value        = config.AvailableColor;
                    view.querySelector('#availableSpaceOutlineColor').value     = config.AvailableOutline;
                    view.querySelector('#usedSpaceFillColor').value             = config.UsedColor;
                    view.querySelector('#usedSpaceOutlineColor').value          = config.UsedOutline;


                    driveData.forEach((drive) => {
                        if (config.IgnoredPartitions) {
                            if (config.IgnoredPartitions.includes(drive.FriendlyName)) {

                                view.querySelector('#' + drive.FriendlyName).checked = false;

                            } else {

                                view.querySelector('#' + drive.FriendlyName).checked = true;
                            }
                        } else {

                            view.querySelector('#' + drive.FriendlyName).checked = true;
                        }
                    });

                    await ApiClient.updatePluginConfiguration(pluginId, config);
                     
                    view.querySelector('#driveChartCutoutPercentage').addEventListener('input',
                        async () => {
                            config = await ApiClient.getPluginConfiguration(pluginId)
                            config.ChartCutoutPercentage = view.querySelector('#driveChartCutoutPercentage').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });


                    view.querySelector('#availableSpaceFillColor').addEventListener('change',
                        async () => {
                            view.querySelector('#availableSpaceFillColorText').value =
                                view.querySelector('#availableSpaceFillColor').value;
                            config = await ApiClient.getPluginConfiguration(pluginId)
                            config.AvailableColor = view.querySelector('#availableSpaceFillColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#availableSpaceOutlineColor').addEventListener('change',
                        async () => {
                            view.querySelector('#availableSpaceOutlineColorText').value =
                                view.querySelector('#availableSpaceOutlineColor').value;
                            config = await ApiClient.getPluginConfiguration(pluginId);
                            config.AvailableOutline = view.querySelector('#availableSpaceOutlineColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#usedSpaceFillColor').addEventListener('change',
                        async () => {
                            view.querySelector('#usedSpaceFillColorText').value =
                                view.querySelector('#usedSpaceFillColor').value;
                            config = await ApiClient.getPluginConfiguration(pluginId);
                            config.UsedColor = view.querySelector('#usedSpaceFillColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#usedSpaceOutlineColor').addEventListener('input',
                        async () => {
                            view.querySelector('#usedSpaceOutlineColorText').value = 
                                view.querySelector('#usedSpaceOutlineColor').value;
                            config = await ApiClient.getPluginConfiguration(pluginId);
                                config.UsedOutline = view.querySelector('#usedSpaceOutlineColorText').value;
                                await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    //Switch Text box entries

                    view.querySelector('#availableSpaceFillColorText').addEventListener('input',
                        async () => {
                            view.querySelector('#availableSpaceFillColor').value =
                                view.querySelector('#availableSpaceFillColorText').value;
                            config = await ApiClient.getPluginConfiguration(pluginId)
                            config.AvailableColor = view.querySelector('#availableSpaceFillColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#availableSpaceOutlineColorText').addEventListener('input',
                        async () => {
                            view.querySelector('#availableSpaceOutlineColor').value =
                                view.querySelector('#availableSpaceOutlineColorText').value;
                            config = await ApiClient.getPluginConfiguration(pluginId)
                            config.AvailableOutline = view.querySelector('#availableSpaceOutlineColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#usedSpaceFillColorText').addEventListener('input',
                        async () => {
                            view.querySelector('#usedSpaceFillColor').value =
                                view.querySelector('#usedSpaceFillColorText').value;
                            cofnig = await ApiClient.getPluginConfiguration(pluginId)
                            config.UsedColor = view.querySelector('#usedSpaceFillColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config);
                        });

                    view.querySelector('#usedSpaceOutlineColorText').addEventListener('input',
                        async () => {
                            view.querySelector('#usedSpaceOutlineColor').value =
                                view.querySelector('#usedSpaceOutlineColorText').value;
                            config = await ApiClient.getPluginConfiguration(pluginId);
                            config.UsedOutline = view.querySelector('#usedSpaceOutlineColorText').value;
                            await ApiClient.updatePluginConfiguration(pluginId, config)
                        });
                });
        }
    });