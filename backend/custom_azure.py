
from storages.backends.azure_storage import AzureStorage

class AzureMediaStorage(AzureStorage):
    account_name = 'brownsugaraccountstorage' # Must be replaced by your <storage_account_name>
    account_key = 'TY3FnHWzTglbO+RWDvmboDbQR+0sbKXt5X+1ZczF4YXPVep4Qrv+aFv+bBlqqkY9m35JMX5U2/aIU0x3FCZHpw==' # Must be replaced by your <storage_account_key>
    azure_container = 'media'
    expiration_secs = None

class AzureStaticStorage(AzureStorage):
    account_name = 'brownsugaraccountstorage' # Must be replaced by your storage_account_name
    account_key = 'TY3FnHWzTglbO+RWDvmboDbQR+0sbKXt5X+1ZczF4YXPVep4Qrv+aFv+bBlqqkY9m35JMX5U2/aIU0x3FCZHpw==' # Must be replaced by your <storage_account_key>
    azure_container = 'static'
    expiration_secs = None


from azure.storage.blob import BlobServiceClient

service = BlobServiceClient(account_url="https://brownsugaraccountstorage.blob.core.windows.net/", credential=credential)
