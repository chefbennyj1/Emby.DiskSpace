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
                        Name: partitionName,
                        Threshold: dlg.querySelector('#notificationAlertThreshold').value,
                        Alias: dlg.querySelector('#aliasPartitionName').value

                    }
                    if (config.MonitoredPartitions) {
                        config.MonitoredPartitions = config.MonitoredPartitions.filter((entry) => entry.Name !== partitionName);
                        config.MonitoredPartitions.push(thresholdEntry);
                    } else {
                        config.MonitoredPartitions = [thresholdEntry];
                    }

                    await ApiClient.updatePluginConfiguration(pluginId, config);
                    driveData = await ApiClient.getJSON(ApiClient.getUrl("GetDriveData"));
                    view.querySelector('.diskSpaceTableResultBody').innerHTML = getDiskSpaceResultTableHtml(driveData);
                    view.querySelectorAll('.partitionOptions').forEach((button) => {
                        button.addEventListener('click',
                            (e) => {
                                openPartitionDialog(e.target.closest('.partitionOptions').id, view, driveData);
                            });
                    });
                    dialogHelper.close(dlg);
                });

            dlg.querySelector('.btnCloseDialog').addEventListener('click',
                () => {
                    dialogHelper.close(dlg);
                });

            loading.hide();
            dialogHelper.open(dlg);
        }
        function getDriveStateSvg(isReady) {
            return isReady
                ? '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="green" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>'
                : '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="goldenrod" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" /></svg> ';
        }

        function getDiskSpaceResultTableHtml(driveData) {
            var html = '';

            driveData.forEach(drive => {

                if (!drive.IsMonitored) return;

                var total = drive.UsedSpace + drive.FreeSpace;
                var thresholdColor = getThresholdExceededColor(drive.Threshold, drive.FreeSpace);


                html += '<tr class="detailTableBodyRow detailTableBodyRow-shaded" id="' + drive.FriendlyName + '">';

                html += '<td data-title="Name" class="detailTableBodyCell fileCell"' + thresholdColor + '>';
                html += '<svg style="height: 25px; width: 25px; margin: 0.6em 0.9em; fill:#4CAF50"><use xlink: href="#' + getDriveIconSvgHtml(drive.Threshold, drive.FreeSpace) + '"></use></svg></td> ';
                html += '<td data-title="State" class="detailTableBodyCell fileCell">' + getDriveStateSvg(drive.IsReady) + '</td>';

                html += '<td data-title="Name" class="detailTableBodyCell fileCell"' + thresholdColor + '>' + drive.Alias + '</td>';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell-shaded"' + thresholdColor + '>' + drive.VolumeLabel + '</td>';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell-shaded"' + thresholdColor + '>' + drive.Format + '</td>';
                html += '<td data-title="Total Size" class="detailTableBodyCell fileCell"' + thresholdColor + '>' + drive.FriendlyTotal + '</td>';
                html += '<td data-title="Used" class="detailTableBodyCell fileCell-shaded"' + thresholdColor + '>' + drive.FriendlyUsed + '</td>';
                html += '<td data-title="Available" class="detailTableBodyCell fileCell"' + thresholdColor + '>' + drive.FriendlyAvailable + '</td>';
                html += '<td data-title="Notifications Enabled" class="detailTableBodyCell fileCell-shaded"' + thresholdColor + '>' + drive.NotificationEnabled + '</td>';
                html += '<td data-title="Notification Threshold" class="detailTableBodyCell fileCell"' + thresholdColor + '>' + (drive.Threshold ? drive.Threshold + 'GB' : 'unset') + '</td>';
                html += '<td data-title="Disk Space" class="detailTableBodyCell fileCell"' + thresholdColor + '>' + Math.round((drive.FreeSpace / total) * 100) + '%</td>';

                html += '<td class="detailTableBodyCell fileCell">';

                html += '<div id="' + drive.FriendlyName + '" class="partitionOptions emby-button"><i class="md-icon">more_horiz</i></div></td>';
                html += '<td class="detailTableBodyCell" style="whitespace:no-wrap;"></td>';
                html += '</tr>';

            });

            return html;
        }

        function getDriveIconSvgHtml(threshold, freespace) {
            return threshold && threshold != 0 ? (freespace / 1073741824.0) < threshold
                ? 'driveFull'
                : 'drive'
                : 'drive';
        }

        function getThresholdExceededColor(threshold, freespace) {
            return threshold && threshold != 0 ? (freespace / 1073741824.0) < threshold ? ' style="color:orangered;"' : '' : '';
        }

        return function (view) {

            view.addEventListener('viewshow',
                async () => {

                    mainTabsManager.setTabs(this, 1, getTabs);

                    var data = await ApiClient.getJSON(ApiClient.getUrl('GetTotalStorage'));
                    view.querySelector('.totalStorage').innerHTML = 'Total Storage: ' + data.Total;


                    var driveData = await ApiClient.getJSON(ApiClient.getUrl("GetDriveData"));


                    if (driveData.Error) {
                        //html += '<h1>' + driveData.Error + '</h1>';
                        //chartRenderContainer.innerHTML = html;
                        return;
                    }
                    view.querySelector('.diskSpaceTableResultBody').innerHTML = getDiskSpaceResultTableHtml(driveData);
                    view.querySelectorAll('.partitionOptions').forEach((button) => {
                        button.addEventListener('click',
                            (e) => {
                                openPartitionDialog(e.target.closest('.partitionOptions').id, view, driveData);
                            });
                    });

                });
        }
    });