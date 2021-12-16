
import requests
import json

# #"Authorization: Bearer fio-u-nwaocZh1WnFZwIZ7KOULKjulmV7n3xNgRkAXJU2Ii1skf_IQnjQR9pwwpZD84Nz-"
# x = requests.get("https://api.frame.io/v2/accounts",
# 	headers={'Authorization': 'Bearer {}'.format('fio-u-nwaocZh1WnFZwIZ7KOULKjulmV7n3xNgRkAXJU2Ii1skf_IQnjQR9pwwpZD84Nz-')})

# x = json.loads(x.text)

# #print(len(x))

# #print(x[1].keys())

# print(x[0]['id'])
# print(x[1]['id'])



''' THIS WILL RETURN ALL THE DATA (i.e. "full asset manifest") ABOUT THE ASSET (BUT NOT THE ASSET)  '''
asset_id = "46e657e8-8204-42e1-ba53-148fa48017ca"
url = "https://api.frame.io/v2/assets/" + asset_id + "?include_deleted=true&type=file"
JWT = "fio-u-nwaocZh1WnFZwIZ7KOULKjulmV7n3xNgRkAXJU2Ii1skf_IQnjQR9pwwpZD84Nz-"

query = {
  "include_deleted": "true",
  "type": "file"
}

headers = {"Authorization": "Bearer "+ JWT}

response = requests.get(url, headers=headers, params=query)

data = response.json()
print(data)