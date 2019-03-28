# İl, İlçe, Bölge ve Mahalle Bilgisi İçin Rest - API

Bu API Türkiye'de yer alan il, ilçe ve mahalle bilgilerini içerir. İl ve ilçe bazında geolocation (enlem-boylam, poligon ve boundingbox) bilgileri de yer almaktadır. Mongodb yedek dosyalarını [buradan](https://drive.google.com/file/d/1e6v4S_-BK8Zs43HYBH5ftidBDrHlOZY7/view?usp=sharing) indirebilirsiniz.

**Ayrıca isterseniz bu servisi https://il-ilce-rest-api.herokuapp.com/v1 adresi üzerinden ücretsiz olarak kullanabilirsiniz.**

## İçindekiler
* [Servis Kullanımı](#service)
    * [İller (/cities)](#cities)
    * [İlçeler (/towns)](#towns)
    * [Semtler (/districts)](#districts)
    * [Mahalleler (/neighborhoods)](#neighborhoods)
* [Data Model](#dataModel)
    * [İl (City)](#dataModelCity)
    * [İlçe (Town)](#dataModelTown)
    * [Semt (District)](#dataModelDistrict)
    * [Mahalle (Neighborhood)](#dataModelNeighborhood)
    * [Konum Bilgisi (Geolocation)](#dataModelGeolocation)

## Polygon Nedir
Polygon bir ilin ya da ilçenin sınırlarının enlem ve boylam bilgisini içeren bir grup veridir. Bu bilgi ile bir noktanın o bölge içinde olup olmadığını bilebilir ya da Google Map API ile harita üzerinde gösterebilirsiniz.

![poligon bilgisi](https://image.ibb.co/hS8N8T/Screenshot_from_2018_06_06_12_16_32.png)

<a name="service"></a>
# Servisin Kullanımı
Tüm cevaplar { status : boolean, data : array, err : 'varsa hata' } şablonunda sunulur. Talep etmiş olduğunuz bilgi "data" bölümünde yer almaktadır. Beklenmeyen bir hata bulunduğunda status = false olacaktır.

Kısıtlamalar: Alınan genel sonuçlarda maksimum 100 data servis edilir. Bu sayıyı ?limit=10 diyerek 10'a indirebilirsiniz. Ayrıca bir sonraki sayfada yer alan bilgileri almak için ise ?skip=(sayı) şeklinde kullanım yapabilirsiniz.

**Tüm endpointler için query string olarak "fields, skip, limit" kullanılabilir. Fields istenen alanlara karşılık gelmektedir.**

Sıralama City > Towns > Districts > Neighborhoods şeklindedir.  
Sıralama İl > İlçe > Semt > Mahalle şeklindedir.

Servis adresi : https://il-ilce-rest-api.herokuapp.com/v1

**Örnek : https://il-ilce-rest-api.herokuapp.com/v1/cities**  

<a name="search"></a>
## Koordinat Arama (/search/coordinates)
Arama özelliğini kullanarak, servise gönderdiğiniz enlem ve boylam bilgisi karşılığında bu koordinatın hangi ilçe ve ilde olduğunun bilgisini 
alabilirsiniz.

### /search/coordinates?lat=40.340134&lon=27.971170
```
[
    {
        "_id":"ce941560c5a7ba9ff5cd24f5f9d75065",
        "name":"Bandırma",
        "city" : "Balıkesir"
    },
    ...
]
```


<a name="cities"></a>
## İller (/cities)
Toplam 81 il bilgisini json array olarak listeler. Default alanlar sadece _id ve isim bilgisidir.

```
[
    {
        "_id":"ce941560c5a7ba9ff5cd24f5f9d75065",
        "name":"İstanbul"
    },
    ...
]
```

### /cities?fields=name,geolocation.lat,geolocation.lon
Sonuçlar içerisinde gelocationda yer alan enlem boylam bilgisini gösterir. Dilerseniz sadece "gelocation" alanını kullanarak gelocation içinde yer alan tüm bilgilere ulaşabilirsiniz.

```
[
    {
        "_id":"ce941560c5a7ba9ff5cd24f5f9d75065"
        "name":"İstanbul",
        "geolocation":{
            "lat":"41.0766019",
            "lon":"29.052495"
        }
    },
    ...
]
```

### /cities?fields=name,towns
İl isimleri ile birlikte o ile ait ilçelerin isim ve id bilgisini listeler.

```
[
    {
        "_id":"ce941560c5a7ba9ff5cd24f5f9d75065",
        "name":"İstanbul",
        "towns":[
            {"_id":"fc74d991616e5931e47ef849ae54e8c2","name":"Adalar"},
            {"_id":"66cd91880b422fa267b41e1777d5d271","name":"Arnavutköy"},
            ...
        ]
    },
    ...
]
```


### /cities?limit=10
Sadece ilk sırada yer alan 10 şehri listeler.

### /cities?limit=10&skip=1
İkinci sayfada yer alan 10 şehri listeler.

## /cities/:id
ID'si verilmiş şehir bilgisini döner.

```
{
    "_id":"ce941560c5a7ba9ff5cd24f5f9d75065",
    "name":"İstanbul",
    "geolocation":{
        "lat":"41.0766019",
        "lon":"29.052495",
        "polygons": [[27.9713956,41.1004234],[27.9736908,41.0990141],...],
        "boundingbox: [40.7289169,41.671,27.9713956,29.958148]
    }
}
```

### /cities/:id?fields=name,towns
ID'si verilmiş şehrin isim ve ilçe bilgilerini listeler.
```
{
    "_id":"ce941560c5a7ba9ff5cd24f5f9d75065",
    "name":"İstanbul",
    "towns":[
        {"_id":"fc74d991616e5931e47ef849ae54e8c2","name":"Adalar"},
        {"_id":"66cd91880b422fa267b41e1777d5d271","name":"Arnavutköy"},
        {"_id":"b17dd334e97c22173275812f47d4a8c2","name":"Ataşehir"},
        {"_id":"4b0fa2e031d02d08a559fbff728b456d","name":"Avcılar"},
        ...
    ]
}
```

### /cities/:id/towns
ID'si verilmiş şehrin **sadece** ilçelerini array olarak listeler.
```
[
    {"_id":"fc74d991616...","name":"Adalar", "city" : "İstanbul"},
    {"_id":"66cd91880b4...","name":"Arnavutköy", "city" : "İstanbul"},
    {"_id":"b17dd334e97...","name":"Ataşehir", "city" : "İstanbul"},
    {"_id":"4b0fa2e031d...","name":"Avcılar", "city" : "İstanbul"},
    ...
]
```

-----
<a name="towns"></a>
## İlçeler (/towns)
Tüm ilçeleri json array olarak listeler(max=100). Default alanlar sadece _id, isim ve il bilgisidir.

```
[
    {
        "_id":"bccdf16204b5a81620ed39c8c69930ea",
        "name":"Kadıköy",
        "city" : "İstanbul"
    },
    ...
]
```

### /towns?fields=name,geolocation.lat,geolocation.lon
Sonuçlar içerisinde gelocationda yer alan enlem boylam bilgisini gösterir. Dilerseniz sadece "gelocation" alanını kullanarak gelocation içinde yer alan tüm bilgilere ulaşabilirsiniz.

```
[
    {
        "_id":"bccdf16204b5a81620ed39c8c69930ea"
        "name":"Kadıköy",
        "geolocation":{
            "lat":"41.0766019",
            "lon":"29.052495"
        }
    },
    ...
]
```

### /towns?fields=name,districts
İlçe isimleri ile birlikte o ilçeye ait semtlerin isim ve id bilgisini listeler.

```
[
    {
        "_id":"bccdf16204b5a81620ed39c8c69930ea",
        "name":"Kadıköy",
        "districts":[
            {"_id":"19136811a8b89351660117988aaab257","name":"Bostancı"},
            {"_id":"d7d8dfc31ec4fe72d6383a0393df7235","name":"Caddebostan"},
            {"_id":"1ce31e4e97cb908b3655f893661e4f1b","name":"Caferağa"}
            ...
        ]
    },
    ...
]
```

### /towns?limit=10
Sadece ilk sırada yer alan 10 ilçeyi listeler.

### /towns?limit=10&skip=1
İkinci sayfada yer alan 10 ilçeyi listeler.

## /towns/:id
ID'si verilmiş ilçe bilgisini döner.

```
{
    "_id":"bccdf16204b5a81620ed39c8c69930ea",
    "name":"Kadıköy",
    "city": "İstanbul",
    "geolocation":{
        "lat":"41.0766019",
        "lon":"29.052495",
        "polygons": [[27.9713956,41.1004234],[27.9736908,41.0990141],...],
        "boundingbox: [40.7289169,41.671,27.9713956,29.958148]
    }
}
```

### /towns/:id?fields=name,districts
ID'si verilmiş ilçenin isim ve semt bilgilerini listeler.
```
{
    "_id":"bccdf16204b5a81620ed39c8c69930ea",
    "name":"Kadıköy",
    "districts":[
        {"_id":"19136811a8b89351660117988aaab257","name":"Bostancı"},
        {"_id":"d7d8dfc31ec4fe72d6383a0393df7235","name":"Caddebostan"},
        {"_id":"1ce31e4e97cb908b3655f893661e4f1b","name":"Caferağa"}
        ...
    ]
}
```

### /towns/:id/districts
ID'si verilmiş ilçenin **sadece** semtlerini array olarak listeler.
```
[
    {"_id":"fc74d991616...","name":"Adalar", "city" : "İstanbul"},
    {"_id":"66cd91880b4...","name":"Arnavutköy", "city" : "İstanbul"},
    {"_id":"b17dd334e97...","name":"Ataşehir", "city" : "İstanbul"},
    {"_id":"4b0fa2e031d...","name":"Avcılar", "city" : "İstanbul"},
    ...
]
```

### /towns/:id/neighborhoods
Bazı durumlar için semt bilgisi gereksiz olabilir. Örneğin Kocaeli > Çayırova için sadece 1 adet semt vardır. Bu durumda Kocaeli > Çayırova > Mahalle şeklinde listelemek isteyebiliriz. Bir ilçeye ait tüm mahalleleri listelemek için bu adres kullanılabilir.
```
[
    {
        "_id":"15b998870108649f796f49cc82a7a9d0",
        "name":"Merdivenköy mah",
        "district":"Merdivenköy",
        "town":"Kadıköy",
        "city":"İstanbul",
        "zip_code":"34732"
    },
    {
        "_id":"240bba936488b60705e7650e5d0548ae",
        "name":"Göztepe mah",
        "district":"Göztepe",
        "town":"Kadıköy",
        "city":"İstanbul",
        "zip_code":"34730"
    },
    ...
]
```

-----
<a name="districts"></a>
## Semtler (/districts)
Tüm semtleri json array olarak listeler(max=100). Default alanlar sadece _id, isim, ilçe ve il bilgisidir.

```
[
    {
        "_id":"dbd0266fcc4d225809c6c6669aa2046a",
        "name":"Feneryolu",
        "town" : "Kadıköy",
        "city" : "İstanbul"
    },
    ...
]
```

### /districts?fields=name
Sonuçlar içerisinde sadece _id ve name bilgisi yer alır

### /districts?fields=name,neighborhoods
Semt isimleri ile birlikte o semte ait mahalle isim ve id bilgisini listeler.

```
[
    {
        "_id":"dbd0266fcc4d225809c6c6669aa2046a",
        "name":"Feneryolu",
        "neighborhoods":[
            {"_id":"799df51fbdb9624b9274b01bd072d749","name":"Feneryolu mah"},
            {"_id":"b588445717478e1a47892e70b44325ac","name":"Zühtüpaşa mah"},
            ...
        ]
    },
    ...
]
```

### /districts?limit=10
Sadece ilk sırada yer alan 10 semti listeler.

### /districts?limit=10&skip=1
İkinci sayfada yer alan 10 semti listeler.

## /districts/:id
ID'si verilmiş semt bilgisini döner.

```
{
    "_id":"dbd0266fcc4d225809c6c6669aa2046a",
    "name":"Feneryolu",
    "town":"Kadıköy",
    "city":"İstanbul"
}
```

### /districts/:id?fields=name,neighborhoods
ID'si verilmiş semtin isim ve mahalle bilgilerini listeler.
```
{
    "_id":"dbd0266fcc4d225809c6c6669aa2046a",
    "name":"Feneryolu",
    "neighborhoods":[
        {"_id":"799df51fbdb9624b9274b01bd072d749","name":"Feneryolu mah"},
        {"_id":"b588445717478e1a47892e70b44325ac","name":"Zühtüpaşa mah"},
        ...
    ]
}
```

### /districts/:id/neighborhoods
ID'si verilmiş semtin **sadece** mahallelerini array olarak listeler.
```
[
    {"_id":"799df51fbdb9624b9274b01bd072d749","name":"Feneryolu mah"},
    {"_id":"b588445717478e1a47892e70b44325ac","name":"Zühtüpaşa mah"},
    ...
]
```

-----
<a name="neighborhoods"></a>
## Mahalleler (/neighborhoods)
Tüm mahalleleri json array olarak listeler(max=100). Default alanlar _id, isim, semt, ilçe, il ve posta kodu bilgisidir.

```
[
    {
        "_id":"799df51fbdb9624b9274b01bd072d749",
        "name":"Feneryolu mah",
        "district":"Feneryolu",
        "town":"Kadıköy",
        "city":"İstanbul",
        "zip_code":"34724"
    },
    ...
]
```

### /neighborhoods?fields=name
Sonuçlar içerisinde sadece _id ve name bilgisi yer alır

### /neighborhoods?limit=10
Sadece ilk sırada yer alan 10 mahalleyi listeler.

### /neighborhoods?limit=10&skip=1
İkinci sayfada yer alan 10 mahalleyi listeler.

## /neighborhoods/:id
ID'si verilmiş mahalle bilgisini döner.

```
{
    "_id":"799df51fbdb9624b9274b01bd072d749",
    "name":"Feneryolu mah",
    "district":"Feneryolu",
    "town":"Kadıköy",
    "city":"İstanbul",
    "zip_code":"34724"
}
```

-----

<a name="dataModel"></a>
## Data Model

<a name="dataModelCity"></a>
### İl (City)
| Alan | Tip | Açıklama |
| ------ | ------ | ------ |
| _id | string | Şehir id|
| name | string | Şehir ismi |
| towns | array | İlçe id listesi |
| geolocation | object | Enlem-boylam, polygon ve box bilgileri |

<a name="dataModelTown"></a>
### İlçe (Town)
| Alan | Tip | Açıklama |
| ------ | ------ | ------ |
| _id | string | İlçe id|
| name | string | İlçe ismi |
| city | string | Şehir ismi |
| districts | array | Semt id listesi |
| geolocation | object | Enlem-boylam, polygon ve box bilgileri |

<a name="dataModelDistrict"></a>
### Semt (District)
| Alan | Tip | Açıklama |
| ------ | ------ | ------ |
| _id | string | Semt id|
| name | string | Semt ismi |
| town | string | İlçe ismi |
| city | string | Şehir ismi |
| neighborhoods | array | Mahalle id listesi |

<a name="dataModelNeighborhood"></a>
### Mahalle (Neighborhood)
| Alan | Tip | Açıklama |
| ------ | ------ | ------ |
| _id | string | Mahalle id|
| name | string | Mahalle ismi |
| district | string | Semt ismi |
| town | string | İlçe ismi |
| city | string | Şehir ismi |
| zip_code | string | Posta Kodu |

<a name="dataModelGeolocation"></a>
### Konum Bilgisi (Geolocation)
| Alan | Tip | Açıklama |
| ------ | ------ | ------ |
| lat | string | Enlem |
| lon | string | Boylam |
| polygons | array | Bölge sınırları |
| bounding_box | array | Bölge sınır köşeleri |


Lisans
-------

    MIT License

    Copyright (c) 2018 Melih Korkmaz

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
