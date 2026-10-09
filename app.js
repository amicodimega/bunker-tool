const STORAGE_KEY = "tw-bunker-planner-settings-v8";
const COORD_RE = /\b(\d{1,3})\|(\d{1,3})\b/g;

const STATIC_ENEMY_VILLAGES = [
  "543|505",
  "540|503",
  "543|511",
  "549|505",
  "550|507",
  "543|498",
  "537|505",
  "570|500",
  "570|501",
  "571|500",
  "571|503",
  "572|500",
  "567|494",
  "566|495",
  "565|495",
  "558|495",
  "560|497",
  "536|500",
  "535|500",
  "533|500",
  "533|499",
  "536|499",
  "535|499",
  "535|495",
  "538|499",
  "533|495",
  "532|498",
  "534|497",
  "532|496",
  "520|469",
  "519|469",
  "519|470",
  "518|470",
  "518|471",
  "517|471",
  "517|472",
  "544|536",
  "546|538",
  "543|535",
  "547|539",
  "549|542",
  "532|523",
  "529|520",
  "530|522",
  "555|503",
  "555|501",
  "559|502",
  "557|500",
  "556|501",
  "561|501",
  "562|500",
  "563|496",
  "561|496",
  "561|498",
  "556|503",
  "558|504",
  "560|500",
  "562|501",
  "559|496",
  "561|491",
  "567|496",
  "559|504",
  "559|497",
  "558|498",
  "557|495",
  "554|500",
  "563|495",
  "565|494",
  "554|498",
  "517|490",
  "517|489",
  "515|486",
  "520|491",
  "520|488",
  "520|486",
  "517|482",
  "525|487",
  "553|548",
  "496|498",
  "522|507",
  "523|505",
  "523|509",
  "526|503",
  "523|503",
  "522|509",
  "521|506",
  "529|503",
  "529|502",
  "527|506",
  "529|501",
  "523|507",
  "526|495",
  "527|495",
  "531|499",
  "532|503",
  "520|522",
  "519|521",
  "519|520",
  "520|521",
  "520|520",
  "519|523",
  "517|521",
  "524|523",
  "522|523",
  "531|525",
  "509|499",
  "510|503",
  "511|503",
  "572|501",
  "514|465",
  "511|463",
  "518|462",
  "513|467",
  "516|463",
  "516|462",
  "512|455",
  "511|469",
  "531|509",
  "527|517",
  "529|515",
  "528|512",
  "528|514",
  "528|506",
  "528|508",
  "531|511",
  "527|508",
  "525|507",
  "525|509",
  "531|513",
  "529|507",
  "528|525",
  "504|539",
  "506|546",
  "504|540",
  "501|542",
  "505|544",
  "537|532",
  "537|531",
  "536|532",
  "538|533",
  "540|531",
  "534|533",
  "534|534",
  "542|534",
  "542|535",
  "543|532",
  "533|538",
  "504|538",
  "502|541",
  "500|539",
  "504|537",
  "501|538",
  "501|539",
  "556|486",
  "556|485",
  "554|482",
  "541|445",
  "549|485",
  "511|562",
  "510|564",
  "513|561",
  "512|557",
  "508|562",
  "510|561",
  "508|563",
  "512|567",
  "515|565",
  "515|561",
  "512|563",
  "515|560",
  "512|552",
  "514|569",
  "509|564",
  "509|548",
  "542|555",
  "542|556",
  "526|554",
  "526|552",
  "529|551",
  "527|552",
  "511|547",
  "514|546",
  "520|503",
  "516|506",
  "517|507",
  "517|506",
  "516|508",
  "518|506",
  "518|504",
  "516|504",
  "516|513",
  "513|513",
  "518|507",
  "516|511",
  "514|511",
  "517|508",
  "517|511",
  "519|511",
  "516|509",
  "518|510",
  "514|503",
  "516|502",
  "518|501",
  "516|501",
  "504|506",
  "494|504",
  "495|506",
  "496|507",
  "504|505",
  "493|504",
  "493|505",
  "500|503",
  "505|507",
  "506|504",
  "508|507",
  "503|507",
  "506|506",
  "509|508",
  "510|509",
  "512|505",
  "511|526",
  "511|525",
  "509|527",
  "510|527",
  "513|522",
  "514|522",
  "513|519",
  "513|523",
  "516|524",
  "516|520",
  "517|524",
  "515|517",
  "516|531",
  "513|530",
  "512|529",
  "514|528",
  "515|525",
  "512|524",
  "519|527",
  "519|526",
  "515|529",
  "515|523",
  "515|527",
  "517|527",
  "517|528",
  "517|529",
  "519|532",
  "517|526",
  "511|487",
  "513|491",
  "511|491",
  "510|491",
  "510|490",
  "513|492",
  "513|490",
  "510|495",
  "516|497",
  "547|455",
  "548|454",
  "546|454",
  "549|454",
  "498|509",
  "499|507",
  "503|509",
  "498|512",
  "497|512",
  "498|508",
  "498|511",
  "503|513",
  "496|509",
  "497|507",
  "502|515",
  "498|510",
  "503|514",
  "499|510",
  "503|515",
  "505|509",
  "500|508",
  "515|553",
  "516|556",
  "517|553",
  "517|546",
  "523|555",
  "523|560",
  "525|555",
  "522|559",
  "517|558",
  "519|551",
  "516|557",
  "515|555",
  "515|554",
  "516|551",
  "514|554",
  "512|556",
  "513|555",
  "512|555",
  "510|556",
  "524|551",
  "528|567",
  "520|553",
  "523|553",
  "525|558",
  "530|557",
  "541|556",
  "513|554",
  "522|556",
  "523|557",
  "521|557",
  "530|564",
  "518|554",
  "521|558",
  "539|561",
  "515|556",
  "517|552",
  "520|554",
  "527|559",
  "522|562",
  "517|549",
  "523|568",
  "513|549",
  "533|563",
  "528|564",
  "522|565",
  "521|565",
  "524|563",
  "519|561",
  "518|559",
  "516|558",
  "524|570",
  "523|569",
  "527|570",
  "525|572",
  "510|486",
  "507|485",
  "507|482",
  "509|483",
  "504|485",
  "505|486",
  "506|485",
  "507|490",
  "506|492",
  "507|492",
  "505|492",
  "507|488",
  "506|487",
  "510|484",
  "509|488",
  "507|489",
  "509|489",
  "509|492",
  "509|497",
  "532|483",
  "532|486",
  "535|481",
  "534|486",
  "533|487",
  "558|487",
  "537|492",
  "537|489",
  "537|487",
  "535|487",
  "554|490",
  "558|490",
  "565|487",
  "556|487",
  "559|492",
  "559|493",
  "557|490",
  "558|493",
  "560|491",
  "562|487",
  "562|490",
  "563|488",
  "559|484",
  "559|488",
  "560|487",
  "538|489",
  "536|490",
  "568|488",
  "566|491",
  "536|489",
  "537|490",
  "539|489",
  "566|490",
  "571|493",
  "536|488",
  "571|487",
  "535|486",
  "568|493",
  "539|488",
  "532|485",
  "571|492",
  "560|485",
  "571|486",
  "572|488",
  "572|491",
  "575|491",
  "570|486",
  "517|500",
  "517|499",
  "518|498",
  "515|501",
  "517|502",
  "515|502",
  "517|498",
  "513|503",
  "513|501",
  "520|500",
  "520|498",
  "512|503",
  "520|501",
  "522|503",
  "514|501",
  "513|497",
  "524|499",
  "526|498",
  "527|498",
  "527|496",
  "524|497",
  "526|497",
  "525|501",
  "522|495",
  "526|499",
  "522|502",
  "513|498",
  "522|501",
  "514|497",
  "516|496",
  "517|497",
  "519|498",
  "524|494",
  "525|495",
  "524|496",
  "523|496",
  "519|499",
  "573|488",
  "573|482",
  "493|543",
  "497|544",
  "491|541",
  "489|539",
  "495|542",
  "491|542",
  "493|542",
  "492|542",
  "489|538",
  "492|547",
  "496|543",
  "490|549",
  "494|542",
  "492|537",
  "495|550",
  "492|541",
  "492|553",
  "492|554",
  "494|556",
  "491|543",
  "494|555",
  "494|554",
  "494|553",
  "495|553",
  "500|553",
  "495|557",
  "496|558",
  "499|551",
  "498|551",
  "501|552",
  "501|551",
  "492|549",
  "509|543",
  "508|542",
  "510|544",
  "496|544",
  "506|541",
  "507|540",
  "508|545",
  "511|545",
  "491|551",
  "489|537",
  "500|558",
  "501|558",
  "500|559",
  "498|547",
  "497|542",
  "494|548",
  "470|550",
  "556|532",
  "557|530",
  "560|531",
  "559|530",
  "555|532",
  "557|533",
  "551|533",
  "552|532",
  "567|532",
  "557|529",
  "568|532",
  "566|537",
  "565|537",
  "556|537",
  "557|537",
  "561|539",
  "559|536",
  "498|532",
  "500|527",
  "504|531",
  "498|528",
  "502|532",
  "496|529",
  "496|532",
  "501|534",
  "497|533",
  "491|530",
  "502|534",
  "501|527",
  "504|533",
  "504|535",
  "501|532",
  "504|530",
  "502|530",
  "503|530",
  "505|531",
  "505|529",
  "504|528",
  "505|535",
  "499|531",
  "501|530",
  "499|533",
  "506|535",
  "498|533",
  "503|529",
  "560|527",
  "554|525",
  "561|529",
  "561|528",
  "563|527",
  "564|527",
  "564|526",
  "565|526",
  "560|525",
  "555|526",
  "554|526",
  "562|526",
  "555|525",
  "558|521",
  "558|527",
  "557|525",
  "547|507",
  "540|506",
  "543|501",
  "546|505",
  "546|507",
  "543|504",
  "549|507",
  "547|505",
  "540|505",
  "552|509",
  "554|508",
  "552|507",
  "546|506",
  "539|506",
  "539|507",
  "541|508",
  "539|508",
  "543|509",
  "539|502",
  "538|501",
  "545|510",
  "532|508",
  "536|504",
  "540|501",
  "543|512",
  "530|509",
  "533|507",
  "536|503",
  "533|503",
  "533|504",
  "530|505",
  "537|508",
  "538|496",
  "535|505",
  "550|504",
  "528|501",
  "540|507",
  "528|502",
  "528|503",
  "542|504",
  "551|506",
  "529|505",
  "539|496",
  "554|504",
  "550|508",
  "535|501",
  "527|502",
  "533|505",
  "567|517",
  "563|516",
  "554|505",
  "567|516",
  "564|515",
  "564|524",
  "570|514",
  "562|524",
  "562|523",
  "561|521",
  "563|523",
  "569|513",
  "561|524",
  "563|522",
  "567|524",
  "570|510",
  "561|515",
  "569|522",
  "569|528",
  "567|519",
  "563|528",
  "567|523",
  "567|527",
  "560|524",
  "560|523",
  "566|520",
  "564|529",
  "565|530",
  "563|524",
  "565|513",
  "568|524",
  "570|523",
  "572|511",
  "568|522",
  "571|518",
  "568|527",
  "573|513",
  "571|517",
  "572|514",
  "570|524",
  "573|514",
  "573|511",
  "571|523",
  "526|528",
  "524|531",
  "526|522",
  "522|526",
  "527|531",
  "525|528",
  "525|527",
  "525|529",
  "528|532",
  "540|547",
  "527|523",
  "529|529",
  "528|526",
  "540|543",
  "539|545",
  "538|546",
  "540|551",
  "540|545",
  "545|546",
  "538|550",
  "541|551",
  "523|523",
  "537|554",
  "544|551",
  "543|545",
  "543|544",
  "541|547",
  "524|532",
  "528|539",
  "522|525",
  "529|539",
  "523|526",
  "532|539",
  "538|544",
  "521|528",
  "545|551",
  "545|549",
  "543|549",
  "520|526",
  "521|530",
  "521|529",
  "522|529",
  "520|531",
  "525|539",
  "526|542",
  "540|544",
  "541|545",
  "539|547",
  "539|549",
  "536|551",
  "539|548",
  "540|549",
  "543|548",
  "546|549",
  "539|554",
  "539|552",
  "538|556",
  "539|555",
  "546|553",
  "546|555",
  "543|550",
  "547|549",
  "545|555",
  "550|550",
  "543|551",
  "551|550",
  "536|567",
  "535|566",
  "535|565",
  "534|563",
  "531|565",
  "554|538",
  "554|537",
  "554|536",
  "555|541",
  "554|542",
  "557|545",
  "556|543",
  "557|543",
  "557|539",
  "560|542",
  "540|562",
  "538|565",
  "542|559",
  "506|521",
  "501|521",
  "502|518",
  "504|519",
  "503|521",
  "504|516",
  "509|518",
  "509|519",
  "505|519",
  "508|520",
  "505|520",
  "512|521",
  "506|522",
  "505|521",
  "503|518",
  "509|524",
  "504|523",
  "501|524",
  "506|518",
  "537|537",
  "539|537",
  "540|537",
  "539|534",
  "541|535",
  "539|540",
  "539|533",
  "542|539",
  "538|535",
  "536|537",
  "538|536",
  "540|539",
  "535|534",
  "535|537",
  "545|542",
  "539|538",
  "535|538",
  "539|539",
  "546|541",
  "548|543",
  "547|541",
  "546|543",
  "544|541",
  "546|542",
  "544|542",
  "549|543",
  "547|545",
  "553|547",
  "548|539",
  "549|552",
  "550|539",
  "545|537",
  "549|534",
  "550|535",
  "551|548",
  "553|551",
  "548|554",
  "556|549",
  "552|540",
  "541|561",
  "522|550",
  "553|540",
  "525|543",
  "526|546",
  "525|540",
  "527|545",
  "528|545",
  "525|547",
  "527|542",
  "527|546",
  "527|547",
  "525|551",
  "525|550",
  "524|550",
  "523|551",
  "529|542",
  "521|545",
  "528|541",
  "520|544",
  "528|543",
  "521|548",
  "533|552",
  "527|548",
  "531|549",
  "529|548",
  "534|550",
  "531|551",
  "532|555",
  "546|552",
  "545|552",
  "538|519",
  "536|515",
  "536|518",
  "538|514",
  "540|514",
  "540|516",
  "537|515",
  "544|517",
  "542|516",
  "545|519",
  "544|519",
  "543|514",
  "543|518",
  "541|518",
  "537|519",
  "543|517",
  "535|514",
  "539|518",
  "539|514",
  "564|506",
  "563|510",
  "564|512",
  "564|508",
  "565|510",
  "562|506",
  "563|505",
  "569|509",
  "575|505",
  "572|507",
  "573|503",
  "572|509",
  "570|506",
  "568|505",
  "570|507",
  "569|508",
  "567|510",
  "566|505",
  "566|510",
  "565|509",
  "564|507",
  "537|516",
  "537|517",
  "538|518",
  "560|506",
  "531|531",
  "532|532",
  "533|526",
  "532|527",
  "535|528",
  "535|529",
  "534|524",
  "537|526",
  "537|529",
  "538|523",
  "538|524",
  "537|525",
  "530|525",
  "535|525",
  "532|531",
  "539|526",
  "534|530",
  "526|526",
  "528|537",
  "543|524",
  "527|555",
  "528|554",
  "529|555",
  "526|562",
  "527|556",
  "527|557",
  "529|553",
  "532|558",
  "528|561",
  "531|553",
  "525|561",
  "527|553",
  "526|563",
  "531|558",
  "530|555",
  "527|563",
  "527|562",
  "529|560",
  "534|559",
  "534|557",
  "532|556",
  "530|562",
  "533|555",
  "533|559",
  "531|557",
  "535|558",
  "533|564",
  "530|567",
  "531|559",
  "544|492",
  "545|492",
  "543|493",
  "541|492",
  "544|491",
  "540|490",
  "542|496",
  "541|488",
  "542|488",
  "545|491",
  "565|498",
  "546|493",
  "543|497",
  "564|499",
  "571|497",
  "571|498",
  "571|496",
  "544|494",
  "564|498",
  "545|499",
  "522|536",
  "522|533",
  "524|530",
  "519|535",
  "519|538",
  "515|541",
  "529|536",
  "528|535",
  "524|538",
  "528|534",
  "526|533",
  "527|537",
  "530|534",
  "528|533",
  "522|541",
  "523|535",
  "524|534",
  "517|538",
  "520|541",
  "514|544",
  "521|540",
  "513|544",
  "515|546",
  "527|533",
  "515|542",
  "514|542",
  "520|539",
  "524|533",
  "532|534",
  "518|542",
  "518|533",
  "515|537",
  "518|534",
  "520|533",
  "523|529",
  "521|533",
  "516|537",
  "532|548",
  "534|554",
  "535|554",
  "536|552",
  "535|551",
  "534|551",
  "534|547",
  "535|547",
  "535|548",
  "535|546",
  "531|548",
  "532|542",
  "536|543",
  "537|544",
  "533|546",
  "533|543",
  "531|545",
  "532|546",
  "534|542",
  "531|543",
  "535|540",
  "530|544",
  "553|515",
  "554|511",
  "555|509",
  "556|509",
  "550|514",
  "553|513",
  "558|506",
  "554|515",
  "550|518",
  "554|517",
  "560|509",
  "556|505",
  "557|506",
  "560|519",
  "549|518",
  "555|519",
  "553|519",
  "559|509",
  "555|521",
  "554|521",
  "552|521",
  "558|519",
  "549|516",
  "554|518",
  "550|520",
  "562|510",
  "547|516",
  "558|513",
  "559|505",
  "558|514",
  "560|516",
  "561|513",
  "557|517",
  "554|522",
  "556|517",
  "557|520",
  "558|523",
  "561|506",
  "557|516",
  "563|506",
  "559|518",
  "555|529",
  "561|522",
  "557|502",
  "558|501",
  "523|516",
  "522|513",
  "520|514",
  "524|519",
  "521|518",
  "523|517",
  "519|512",
  "522|511",
  "519|513",
  "523|511",
  "524|514",
  "518|514",
  "521|517",
  "523|519",
  "522|518",
  "523|518",
  "523|515",
  "522|510",
  "434|478",
  "433|477",
  "433|473",
  "502|497",
  "501|488",
  "501|486",
  "499|490",
  "503|487",
  "503|499",
  "501|484",
  "502|484",
  "502|486",
  "501|496",
  "501|491",
  "503|492",
  "501|494",
  "503|493",
  "504|500",
  "500|498",
  "500|497",
  "505|499",
  "505|489",
  "504|498",
  "505|487",
  "501|492",
  "508|495",
  "504|495",
  "512|485",
  "509|495",
  "512|482",
  "516|485",
  "512|483",
  "538|457",
  "538|458",
  "535|453",
  "534|453",
  "533|455",
  "535|454",
  "532|453",
  "538|451",
  "536|461",
  "544|448",
  "544|445",
  "546|450",
  "548|447",
  "548|446",
  "537|458",
  "545|444",
  "552|451",
  "553|448",
  "550|449",
  "550|448",
  "545|446",
  "552|452",
  "552|450",
  "556|449",
  "526|518",
  "528|520",
  "528|521",
  "529|517",
  "524|522",
  "525|522",
  "523|522",
  "545|521",
  "524|521",
  "526|512",
  "529|521",
  "531|517",
  "530|515",
  "529|512",
  "532|514",
  "544|527",
  "543|526",
  "546|525",
  "543|528",
  "546|529",
  "547|526",
  "548|519",
  "546|524",
  "548|525",
  "547|524",
  "544|525",
  "532|521",
  "551|522",
  "552|527",
  "552|528",
  "549|530",
  "543|483",
  "541|482",
  "544|482",
  "545|483",
  "543|484",
  "542|484",
  "543|487",
  "547|482",
  "557|481",
  "558|480",
  "555|481",
  "558|481",
  "555|482",
  "557|482",
  "557|480",
  "556|475",
  "568|483",
  "565|480",
  "565|484",
  "564|483",
  "565|485",
  "563|483",
  "566|485",
  "562|482",
  "562|481",
  "568|485",
  "566|482",
  "570|485",
  "563|480",
  "575|487",
  "515|478",
  "503|482",
  "517|474",
  "511|480",
  "509|486",
  "511|475",
  "519|477",
  "516|474",
  "511|474",
  "507|474",
  "513|473",
  "506|473",
  "514|472",
  "517|473",
  "508|471",
  "514|471",
  "516|478",
  "510|481",
  "515|476",
  "521|478",
  "508|475",
  "509|475",
  "517|478",
  "521|477",
  "516|470",
  "518|476",
  "511|471",
  "520|477",
  "513|477",
  "512|473",
  "517|475",
  "516|473",
  "512|477",
  "513|475",
  "510|478",
  "516|488",
  "516|486",
  "516|487",
  "534|450",
  "532|450",
  "535|445",
  "536|447",
  "534|452",
  "534|451",
  "539|438",
  "518|494",
  "520|493",
  "515|490",
  "512|494",
  "512|493",
  "513|493",
  "514|493",
  "515|493",
  "516|493",
  "517|494",
  "520|496",
  "521|497",
  "520|495",
  "516|490",
  "517|488",
  "518|490",
  "560|463",
  "562|464",
  "560|462",
  "562|463",
  "556|466",
  "552|467",
  "555|468",
  "564|462",
  "531|494",
  "530|494",
  "531|492",
  "527|491",
  "529|493",
  "528|492",
  "528|494",
  "528|493",
  "534|491",
  "526|494",
  "532|489",
  "532|491",
  "535|492",
  "530|489",
  "530|491",
  "531|487",
  "531|488",
  "536|492",
  "535|489",
  "534|492",
  "528|491",
  "443|459",
  "442|460",
  "442|458",
  "439|459",
  "443|458",
  "442|457",
  "442|455",
  "513|526",
  "513|524",
  "509|528",
  "538|461",
  "542|450",
  "541|451",
  "544|449",
  "543|451",
  "540|456",
  "541|454",
  "542|459",
  "549|450",
  "540|460",
  "539|454",
  "550|456",
  "552|459",
  "552|458",
  "554|459",
  "553|461",
  "536|458",
  "554|460",
  "554|463",
  "539|460",
  "545|458",
  "496|501",
  "500|504",
  "493|499",
  "492|502",
  "494|499",
  "498|495",
  "500|495",
  "499|503",
  "499|497",
  "497|503",
  "491|499",
  "493|497",
  "493|500",
  "492|496",
  "496|497",
  "498|500",
  "495|499",
  "498|501",
  "487|500",
  "485|506",
  "438|471",
  "439|470",
  "439|469",
  "436|470",
  "436|472",
  "443|471",
  "443|472",
  "441|470",
  "549|528",
  "549|532",
  "553|527",
  "549|529",
  "546|526",
  "550|523",
  "550|527",
  "549|522",
  "544|532",
  "547|530",
  "552|530",
  "547|529",
  "552|529",
  "553|528",
  "511|466",
  "509|464",
  "507|467",
  "508|466",
  "511|464",
  "512|462",
  "510|467",
  "508|461",
  "506|460",
  "510|469",
  "508|469",
  "512|469",
  "508|462",
  "512|466",
  "510|462",
  "510|465",
  "512|468",
  "506|470",
  "509|467",
  "506|466",
  "506|465",
  "510|460",
  "509|462",
  "510|463",
  "509|471",
  "510|471",
  "515|435",
  "515|440",
  "512|438",
  "513|439",
  "514|438",
  "517|435",
  "513|435",
  "514|436",
  "516|435",
  "513|430",
  "514|430",
  "513|432",
  "512|434",
  "515|432",
  "515|429",
  "519|428",
  "523|430",
  "519|430",
  "514|426",
  "512|433",
  "514|428",
  "541|477",
  "544|480",
  "543|477",
  "544|477",
  "550|475",
  "535|477",
  "537|475",
  "539|474",
  "555|479",
  "540|480",
  "542|478",
  "548|480",
  "551|480",
  "544|475",
  "547|478",
  "544|479",
  "548|479",
  "547|475",
  "557|477",
  "557|476",
  "548|474",
  "552|472",
  "551|474",
  "546|476",
  "549|477",
  "558|469",
  "559|471",
  "560|472",
  "562|477",
  "562|479",
  "564|476",
  "557|470",
  "558|471",
  "559|470",
  "564|478",
  "560|471",
  "556|471",
  "567|478",
  "565|473",
  "560|473",
  "565|468",
  "564|468",
  "563|468",
  "566|469",
  "566|475",
  "556|470",
  "561|472",
  "567|471",
  "567|473",
  "569|474",
  "568|476",
  "568|470",
  "565|467",
  "570|479",
  "569|477",
  "565|469",
  "562|474",
  "566|474",
  "566|471",
  "564|467",
  "563|475",
  "569|470",
  "561|468",
  "563|472",
  "524|481",
  "525|482",
  "521|483",
  "523|485",
  "525|484",
  "525|488",
  "522|485",
  "519|488",
  "522|489",
  "519|485",
  "520|485",
  "519|487",
  "523|489",
  "521|490",
  "522|488",
  "523|482",
  "524|486",
  "521|482",
  "544|469",
  "546|467",
  "544|463",
  "543|465",
  "542|471",
  "543|473",
  "546|473",
  "541|470",
  "543|469",
  "547|474",
  "513|479",
  "512|486",
  "513|480",
  "513|487",
  "513|482",
  "500|481",
  "498|479",
  "497|477",
  "497|480",
  "501|481",
  "503|479",
  "498|480",
  "496|479",
  "515|467",
  "521|467",
  "521|466",
  "517|464",
  "517|468",
  "516|467",
  "518|464",
  "521|465",
  "520|465",
  "522|466",
  "514|469",
  "514|462",
  "516|461",
  "519|460",
  "506|450",
  "510|445",
  "511|445",
  "509|447",
  "511|447",
  "507|450",
  "519|437",
  "495|494",
  "491|490",
  "496|493",
  "495|495",
  "492|485",
  "494|494",
  "494|486",
  "489|488",
  "489|487",
  "495|489",
  "493|489",
  "493|487",
  "489|496",
  "487|496",
  "488|495",
  "492|490",
  "496|489",
  "493|486",
  "497|489",
  "491|485",
  "494|488",
  "496|495",
  "496|494",
  "490|491",
  "493|495",
  "494|484",
  "494|485",
  "459|449",
  "455|446",
  "458|442",
  "460|450",
  "459|439",
  "458|446",
  "460|446",
  "510|459",
  "506|461",
  "501|457",
  "498|463",
  "502|458",
  "499|455",
  "497|454",
  "500|456",
  "502|454",
  "497|455",
  "496|456",
  "499|448",
  "502|448",
  "503|446",
  "500|445",
  "497|447",
  "496|444",
  "496|443",
  "495|443",
  "494|440",
  "493|436",
  "494|436",
  "494|435",
  "493|437",
  "495|433",
  "497|433",
  "499|442",
  "500|442",
  "499|440",
  "498|439",
  "499|438",
  "499|435",
  "499|434",
  "501|436",
  "502|439",
  "503|440",
  "506|445",
  "507|444",
  "508|442",
  "507|440",
  "508|439",
  "508|438",
  "510|438",
  "510|437",
  "510|436",
  "509|434",
  "510|431",
  "512|430",
  "508|430",
  "507|429",
  "505|428",
  "505|432",
  "506|430",
  "511|432",
  "510|439",
  "504|428",
  "508|429",
  "511|443",
  "503|429",
  "509|427",
  "510|428",
  "506|426",
  "508|426",
  "513|425",
  "472|442",
  "495|471",
  "497|463",
  "494|457",
  "496|458",
  "497|466",
  "498|465",
  "494|468",
  "496|461",
  "494|458",
  "494|469",
  "496|463",
  "502|471",
  "501|470",
  "502|470",
  "498|462",
  "499|460",
  "499|461",
  "499|473",
  "501|467",
  "501|471",
  "501|468",
  "501|465",
  "495|461",
  "500|473",
  "503|462",
  "501|464",
  "500|468",
  "499|471",
  "500|471",
  "498|470",
  "498|471",
  "491|466",
  "492|468",
  "491|467",
  "490|466",
  "491|468",
  "508|453",
  "497|426",
  "487|436",
  "485|437",
  "488|439",
  "485|440",
  "482|438",
  "487|434",
  "488|442",
  "487|440",
  "483|439",
  "486|438",
  "483|438",
  "482|434",
  "490|433",
  "482|433",
  "479|435",
  "479|434",
  "494|432",
  "488|432",
  "487|433",
  "493|432",
  "497|436",
  "493|429",
  "486|439",
  "481|433",
  "481|432",
  "488|437",
  "498|429",
  "482|439",
  "488|430",
  "491|429",
  "482|430",
  "485|436",
  "489|429",
  "493|427",
  "482|431",
  "496|430",
  "495|427",
  "494|429",
  "484|430",
  "483|429",
  "499|427",
  "491|432",
  "489|434",
  "480|435",
  "492|431",
  "496|425",
  "496|428",
  "478|429",
  "481|430",
  "494|425",
  "477|429",
  "466|437",
  "467|437",
  "464|438",
  "471|434",
  "467|433",
  "468|434",
  "464|435",
  "531|482",
  "532|478",
  "529|484",
  "530|482",
  "529|476",
  "529|482",
  "531|479",
  "530|480",
  "528|482",
  "527|480",
  "526|477",
  "528|475",
  "530|475",
  "527|474",
  "533|475",
  "530|471",
  "528|486",
  "531|485",
  "534|479",
  "548|461",
  "548|460",
  "553|462",
  "551|460",
  "550|465",
  "551|462",
  "552|461",
  "552|462",
  "546|465",
  "552|463",
  "553|463",
  "533|479",
  "545|500",
  "545|497",
  "546|497",
  "546|501",
  "544|500",
  "546|503",
  "548|502",
  "547|500",
  "552|488",
  "551|488",
  "551|487",
  "550|491",
  "553|486",
  "556|492",
  "557|493",
  "551|495",
  "555|495",
  "555|496",
  "552|492",
  "550|495",
  "551|492",
  "550|496",
  "549|492",
  "551|498",
  "552|499",
  "553|497",
  "553|498",
  "553|501",
  "567|502",
  "566|501",
  "568|500",
  "566|503",
  "570|497",
  "569|497",
  "571|504",
  "568|498",
  "566|498",
  "551|503",
  "552|502",
  "551|502",
  "552|501",
  "574|498",
  "571|502",
  "550|501",
  "563|497",
  "564|494",
  "575|499",
  "519|459",
  "521|456",
  "519|455",
  "524|457",
  "523|457",
  "519|457",
  "520|457",
  "525|452",
  "528|453",
  "525|453",
  "528|454",
  "529|453",
  "529|455",
  "527|456",
  "530|455",
  "524|455",
  "527|458",
  "518|459",
  "513|443",
  "526|453",
  "518|442",
  "516|443",
  "519|443",
  "516|442",
  "520|445",
  "526|437",
  "524|441",
  "524|439",
  "522|438",
  "522|437",
  "518|436",
  "517|439",
  "517|441",
  "519|439",
  "522|441",
  "515|441",
  "515|444",
  "522|431",
  "514|443",
  "513|444",
  "514|444",
  "518|434",
  "522|440",
  "524|429",
  "523|436",
  "525|430",
  "528|430",
  "531|433",
  "509|477",
  "526|439",
  "515|543"
];

const UNIT_BASE_MINUTES = {
  spear: 18,
  sword: 22,
  archer: 18,
  heavy: 11
};

const UNIT_LABEL = {
  spear: "spear",
  sword: "sword",
  archer: "archer",
  heavy: "heavy"
};

const UNIT_TW_LABEL = {
  spear: "lance",
  sword: "spade",
  archer: "arcieri",
  heavy: "oni"
};

const els = {
  worldSpeed: document.getElementById("worldSpeed"),
  unitSpeed: document.getElementById("unitSpeed"),
  bunkerCoordsInput: document.getElementById("bunkerCoordsInput"),
  defaultBunkerTarget: document.getElementById("defaultBunkerTarget"),
  defaultBunkerArrival: document.getElementById("defaultBunkerArrival"),
  bunkerTableBody: document.getElementById("bunkerTableBody"),
  emptyBunkerHint: document.getElementById("emptyBunkerHint"),
  troopCsv: document.getElementById("troopCsv"),
  troopTableBody: document.getElementById("troopTableBody"),
  emptyTroopHint: document.getElementById("emptyTroopHint"),
  minPacketEnabled: document.getElementById("minPacketEnabled"),
  minPacketWeight: document.getElementById("minPacketWeight"),
  minPacketRoundingEnabled: document.getElementById("minPacketRoundingEnabled"),
  outputSort: document.getElementById("outputSort"),
  resultBox: document.getElementById("resultBox"),
  errorBox: document.getElementById("errorBox"),
  summaryBox: document.getElementById("summaryBox"),
  warningsBox: document.getElementById("warningsBox"),
  settingsDialog: document.getElementById("settingsDialog"),
  settingsImport: document.getElementById("settingsImport")
};

let bunkerRows = [];
let friendlyRows = [];
let mapCommands = [];
let mapPlanReady = false;
let importedTroops = "";
let importedDefenses = "";
let hiddenExistingBunkers = new Set();
let confirmedSent = {};
let planSnapshot = "";

function parseCoords(text){
  const found = [];
  const seen = new Set();
  for(const match of String(text || "").matchAll(COORD_RE)){
    const coord = `${Number(match[1])}|${Number(match[2])}`;
    if(seen.has(coord)) continue;
    seen.add(coord);
    found.push({ coord, x: Number(match[1]), y: Number(match[2]) });
  }
  return found;
}

function distance(a,b){
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function minDistanceToEnemies(village,enemies){
  if(!enemies.length) return 0;
  return Math.min(...enemies.map(enemy => distance(village, enemy)));
}

function travelSeconds(from,to,unit,speed,unitSpeed,supportSlowdownPercent = 0){
  const fields = distance(from,to);
  const slowdown = Number(supportSlowdownPercent || 0);
  const supportSpeedFactor = Math.max(0.01, 1 - slowdown / 100);
  const minutes = UNIT_BASE_MINUTES[unit] * fields / speed / unitSpeed / supportSpeedFactor;
  return Math.round(minutes * 60);
}

function pad2(value){
  return String(value).padStart(2,"0");
}

function formatDateTime(date){
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function parseDateTime(value){
  const text = String(value || "").trim();
  if(!text) return null;

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || 0);
  if(hour > 23 || minute > 59 || second > 59) return null;

  const date = new Date(year, month, day, hour, minute, second, 0);
  if(date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

function addSeconds(date,seconds){
  return new Date(date.getTime() + seconds * 1000);
}

function splitCsvLine(line, delimiter = ","){
  const out = [];
  let current = "";
  let quoted = false;
  for(let i = 0; i < line.length; i += 1){
    const char = line[i];
    if(char === '"'){
      if(quoted && line[i + 1] === '"'){ current += '"'; i += 1; }
      else quoted = !quoted;
    }else if(char === delimiter && !quoted){
      out.push(current.trim());
      current = "";
    }else{
      current += char;
    }
  }
  out.push(current.trim());
  return out;
}

function toInt(value){
  const parsed = Number(String(value || "0").replace(/[\s\u00a0\u202f]/g, "").replace(/\./g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTroops(text, keepAll = false){
  const rows = String(text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if(!rows.length) return [];

  let delimiter = ",";
  const headerIndex = rows.findIndex(line => {
    for(const candidate of [",", "\t", ";"]){
      if(splitCsvLine(line, candidate)[0].replace(/^\uFEFF/, "").toLowerCase() === "coords"){
        delimiter = candidate;
        return true;
      }
    }
    return false;
  });
  if(headerIndex === -1) throw new Error("L’export deve contenere la colonna Coords.");
  const headers = splitCsvLine(rows[headerIndex], delimiter).map(h => h.replace(/^\uFEFF/, "").toLowerCase());
  const required = ["coords","player","spear","sword","heavy"];
  for(const name of required){
    if(!headers.includes(name)) throw new Error(`Colonna mancante: ${name}`);
  }

  const index = Object.fromEntries(headers.map((h,i) => [h,i]));
  const villages = [];

  for(const line of rows.slice(headerIndex + 1)){
    const cols = splitCsvLine(line, delimiter);
    const coords = parseCoords(cols[index.coords] || "")[0];
    if(!coords) continue;
    const player = cols[index.player] || "";
    const spear = toInt(cols[index.spear]);
    const sword = toInt(cols[index.sword]);
    const archer = toInt(cols[index.archer]);
    const heavy = toInt(cols[index.heavy]);
    if(!keepAll && spear < 50 && sword < 50 && archer < 50 && heavy < 50) continue;
    const weight = spear + sword + archer + heavy * 4;
    if(!keepAll && weight <= 0) continue;
    villages.push({ id: crypto.randomUUID(), enabled: true, ...coords, player, spear, sword, archer, heavy, weight });
  }

  return villages;
}

function availableWeight(source){
  return source.spear + source.sword + (source.archer || 0) + source.heavy * 4;
}

function sendWeight(send){
  return send.spear + send.sword + (send.archer || 0) + send.heavy * 4;
}

function effectiveWeight(weight, roundingEnabled){
  if(!roundingEnabled || weight <= 0) return weight;
  return Math.floor(weight / 1000) * 1000;
}

function takeDefense(source, wanted){
  const send = { spear: 0, sword: 0, archer: 0, heavy: 0 };
  let remaining = wanted;

  const heavyNeeded = Math.floor(remaining / 4);
  send.heavy = Math.min(source.heavy, heavyNeeded);
  source.heavy -= send.heavy;
  remaining -= send.heavy * 4;

  send.spear = Math.min(source.spear, remaining);
  source.spear -= send.spear;
  remaining -= send.spear;

  send.sword = Math.min(source.sword, remaining);
  source.sword -= send.sword;
  remaining -= send.sword;

  send.archer = Math.min(source.archer, remaining);
  source.archer -= send.archer;
  remaining -= send.archer;

  if(remaining > 0 && source.heavy > 0){
    send.heavy += 1;
    source.heavy -= 1;
  }

  source.weight = availableWeight(source);
  return { send, sentWeight: sendWeight(send) };
}

function restoreDefense(source,send){
  source.spear += send.spear;
  source.sword += send.sword;
  source.archer += send.archer;
  source.heavy += send.heavy;
  source.weight = availableWeight(source);
}

function sentUnits(send){
  return ["spear","sword","archer","heavy"].filter(unit => send[unit] > 0);
}

function getUnitDeadlines(source,bunker,send,settings){
  const deadlines = {};
  for(const unit of sentUnits(send)){
    const seconds = travelSeconds(source,bunker,unit,settings.worldSpeed,settings.unitSpeed,bunker.supportSlowdown);
    deadlines[unit] = addSeconds(bunker.arrival, -seconds);
  }
  return deadlines;
}

function getItalyNow(){
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
    0
  );
}

function removeExpiredUnits(source,send,deadlines,now){
  for(const unit of ["spear","sword","archer","heavy"]){
    if(!send[unit]) continue;
    if(deadlines[unit] && deadlines[unit].getTime() <= now.getTime()){
      source[unit] += send[unit];
      send[unit] = 0;
      delete deadlines[unit];
    }
  }

  source.weight = availableWeight(source);
  return sendWeight(send);
}

function formatUnitSendLine(amount,unit,departure){
  return `${amount} ${UNIT_TW_LABEL[unit]} [unit]${unit}[/unit] | partenza: ${formatDateTime(departure)}`;
}

function getSettings(){
  return {
    worldSpeed: Number(els.worldSpeed.value),
    unitSpeed: Number(els.unitSpeed.value),
    defaultBunkerTarget: els.defaultBunkerTarget.value,
    defaultBunkerArrival: els.defaultBunkerArrival.value,
    bunkers: bunkerRows.map(row => ({ ...row })),
    maxSenderPerBunker: "",
    outputSort: els.outputSort.value,
    troopCsv: importedTroops,
    defenseCsv: importedDefenses,
    hiddenExistingBunkers: [...hiddenExistingBunkers],
    confirmedSent: JSON.parse(JSON.stringify(confirmedSent)),
    reserveSpear: document.getElementById("reserveSpear").value,
    reserveSword: document.getElementById("reserveSword").value,
    reserveArcher: document.getElementById("reserveArcher").value,
    reserveHeavy: document.getElementById("reserveHeavy").value,
    friendlyRows: friendlyRows.map(row => ({ ...row })),
    minPacketEnabled: els.minPacketEnabled.checked,
    minPacketWeight: els.minPacketWeight.value,
    minPacketRoundingEnabled: els.minPacketRoundingEnabled.checked
  };
}

function setSettings(settings){
  confirmedSent = {};
  for(const [coord, units] of Object.entries(settings.confirmedSent || {})){
    if(!parseCoords(coord).length) continue;
    confirmedSent[coord] = Object.fromEntries(["spear", "sword", "archer", "heavy"].map(unit => [unit, Math.max(0, Math.trunc(Number(units[unit]) || 0))]));
  }
  if(settings.worldSpeed !== undefined && settings.worldSpeed !== "") els.worldSpeed.value = settings.worldSpeed;
  if(settings.unitSpeed !== undefined && settings.unitSpeed !== "") els.unitSpeed.value = settings.unitSpeed;
  if(settings.defaultBunkerTarget !== undefined) els.defaultBunkerTarget.value = settings.defaultBunkerTarget;
  if(settings.defaultBunkerArrival !== undefined) els.defaultBunkerArrival.value = settings.defaultBunkerArrival;
  if(settings.bunkers !== undefined) bunkerRows = normalizeBunkers(settings.bunkers);
  if(settings.outputSort !== undefined) els.outputSort.value = settings.outputSort;
  if(settings.troopCsv !== undefined) { importedTroops = settings.troopCsv; els.troopCsv.value = importedTroops; }
  importedDefenses = settings.defenseCsv || "";
  hiddenExistingBunkers = new Set(Array.isArray(settings.hiddenExistingBunkers) ? settings.hiddenExistingBunkers : []);
  document.getElementById("defenseCsv").value = importedDefenses;
  for(const id of ["reserveSpear", "reserveSword", "reserveArcher", "reserveHeavy"]) document.getElementById(id).value = settings[id] ?? 0;
  if(settings.friendlyRows !== undefined) friendlyRows = normalizeFriendlyRows(settings.friendlyRows);
  if(settings.minPacketEnabled !== undefined) els.minPacketEnabled.checked = Boolean(settings.minPacketEnabled);
  if(settings.minPacketWeight !== undefined) els.minPacketWeight.value = settings.minPacketWeight;
  if(settings.minPacketRoundingEnabled !== undefined) els.minPacketRoundingEnabled.checked = Boolean(settings.minPacketRoundingEnabled);
  renderBunkerTable();
  renderTroopTable();
  updateImportStatus();
}

function normalizeBunkers(rows){
  return (Array.isArray(rows) ? rows : []).map(row => {
    const coords = parseCoords(row.coord || "")[0];
    if(!coords) return null;
    return {
      id: row.id || crypto.randomUUID(),
      coord: coords.coord,
      enabled: row.enabled !== false,
      target: String(row.target || ""),
      arrival: String(row.arrival || ""),
      supportSlowdown: String(row.supportSlowdown || "")
    };
  }).filter(Boolean);
}

function normalizeFriendlyRows(rows){
  return (Array.isArray(rows) ? rows : []).map(row => {
    const coords = parseCoords(row.coord || "")[0];
    if(!coords) return null;
    const spear = toInt(row.spear);
    const sword = toInt(row.sword);
    const archer = toInt(row.archer);
    const heavy = toInt(row.heavy);
    if(spear < 50 && sword < 50 && archer < 50 && heavy < 50) return null;
    const weight = spear + sword + archer + heavy * 4;
    if(weight <= 0) return null;
    return {
      id: row.id || crypto.randomUUID(),
      enabled: row.enabled !== false,
      coord: coords.coord,
      x: coords.x,
      y: coords.y,
      player: row.player || "",
      spear,
      sword,
      archer,
      heavy,
      weight
    };
  }).filter(Boolean);
}

function renderTroopTable(preservePlan = false){
  if(!preservePlan){
    mapCommands = [];
    mapPlanReady = false;
    window.refreshVillageMap?.();
  }
  els.troopTableBody.innerHTML = "";
  els.emptyTroopHint.hidden = friendlyRows.length > 0;

  const availableRows = friendlyRows.map(getSendableSource);
  const visibleRows = window.tableTools?.apply("friendly", availableRows) || availableRows;
  window.tableTools?.update("friendly", availableRows, visibleRows);
  for(const row of visibleRows){
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    tr.innerHTML = `
      <td><input type="checkbox" data-field="enabled" ${row.enabled ? "checked" : ""} /></td>
      <td class="mono">${row.coord}</td>
      <td>${row.player || ""}</td>
      <td class="num">${row.spear}</td>
      <td class="num">${row.sword}</td>
      <td class="num">${row.archer}</td>
      <td class="num">${row.heavy}</td>
      <td class="num">${row.weight}</td>
      <td><button type="button" data-action="remove">Rimuovi</button></td>
    `;
    els.troopTableBody.appendChild(tr);
  }
}

function updateImportStatus(){
  document.getElementById("troopImportStatus").textContent = importedTroops && importedDefenses
    ? "Truppe e difese caricate. La tabella mostra le truppe disponibili."
    : importedTroops ? "Truppe proprie caricate. Incolla le difese presenti."
    : importedDefenses ? "Difese presenti caricate. Incolla le truppe proprie."
    : "Incolla entrambi gli export per caricare i mittenti.";
}

function estimateFriendlyRows(troopText, defenseText){
  if(!troopText || !defenseText) return [];
  const troops = parseTroops(troopText, true);
  const defenses = new Map(parseTroops(defenseText, true).map(row => [row.coord, row]));
  const previous = new Map(friendlyRows.map(row => [row.coord, row]));
  return normalizeFriendlyRows(troops.flatMap(row => {
    const defense = defenses.get(row.coord);
    if(!defense) return [];
    const old = previous.get(row.coord);
    return [{...row, id: old?.id || row.id, enabled: old?.enabled ?? true,
      spear: Math.min(row.spear, defense.spear),
      sword: Math.min(row.sword, defense.sword),
      archer: Math.min(row.archer, defense.archer),
      heavy: Math.min(row.heavy, defense.heavy)}];
  }));
}

function applyTroopExport(kind){
  const isTroops = kind === "troops";
  const input = document.getElementById(isTroops ? "troopCsv" : "defenseCsv");
  const error = document.getElementById(isTroops ? "troopImportError" : "defenseImportError");
  try {
    const text = input.value.trim();
    if(!text || !parseTroops(text, true).length) throw new Error("Incolla un export con almeno un villaggio.");
    const nextTroops = isTroops ? text : importedTroops;
    const nextDefenses = isTroops ? importedDefenses : text;
    const nextRows = estimateFriendlyRows(nextTroops, nextDefenses);
    importedTroops = nextTroops;
    importedDefenses = nextDefenses;
    friendlyRows = nextRows;
    renderTroopTable();
    updateImportStatus();
    persist();
    error.hidden = true;
    document.getElementById(isTroops ? "troopImportDialog" : "defenseImportDialog").close();
  } catch(err) {
    error.textContent = err.message;
    error.hidden = false;
  }
}

function getSendableSource(row){
  const result = {...row};
  for(const [unit, id] of [["spear", "reserveSpear"], ["sword", "reserveSword"], ["archer", "reserveArcher"], ["heavy", "reserveHeavy"]]){
    result[unit] = Math.max(0, (row[unit] || 0) - (confirmedSent[row.coord]?.[unit] || 0) - Math.max(0, Math.trunc(Number(document.getElementById(id).value) || 0)));
  }
  result.weight = availableWeight(result);
  return result;
}

function getActiveFriendlySources(){
  return friendlyRows.filter(row => row.enabled).map(getSendableSource).filter(row => row.weight > 0);
}

function getActiveBunkers(){
  return bunkerRows.filter(row => row.enabled).map(row => {
    const coords = parseCoords(row.coord)[0];
    return {
      ...coords,
      id: row.id,
      target: Number(row.target),
      arrival: parseDateTime(row.arrival),
      arrivalText: row.arrival,
      supportSlowdown: Number(row.supportSlowdown || 0)
    };
  });
}

function persist(){
  mapCommands = [];
  mapPlanReady = false;
  window.refreshVillageMap?.();
}

function renderBunkerTable(){
  mapCommands = [];
  mapPlanReady = false;
  window.refreshVillageMap?.();
  els.bunkerTableBody.innerHTML = "";
  els.emptyBunkerHint.hidden = bunkerRows.length > 0;

  for(const row of bunkerRows){
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    tr.innerHTML = `
      <td><input type="checkbox" data-field="enabled" ${row.enabled ? "checked" : ""} /></td>
      <td class="mono">${row.coord}</td>
      <td><input class="tableInput" type="number" min="1" step="1" data-field="target" value="${row.target}" /></td>
      <td><input class="tableInput" type="datetime-local" step="1" data-field="arrival" value="${row.arrival}" /></td>
      <td><input class="tableInput" type="number" min="0" max="99" step="1" data-field="supportSlowdown" value="${row.supportSlowdown || ""}" placeholder="0" /></td>
      <td><button type="button" data-action="remove">Rimuovi</button></td>
    `;
    els.bunkerTableBody.appendChild(tr);
  }
}

function addBunkersFromInput(){
  clearError();
  const coords = parseCoords(els.bunkerCoordsInput.value);
  if(!coords.length){
    showError("Inserisci almeno una coordinata bunker.");
    return;
  }

  const existing = new Set(bunkerRows.map(row => row.coord));
  for(const coord of coords){
    if(existing.has(coord.coord)) continue;
    bunkerRows.push({
      id: crypto.randomUUID(),
      coord: coord.coord,
      enabled: true,
      target: els.defaultBunkerTarget.value,
      arrival: els.defaultBunkerArrival.value,
      supportSlowdown: ""
    });
    existing.add(coord.coord);
  }

  els.bunkerCoordsInput.value = "";
  renderBunkerTable();
  persist();
}

function validate(settings,bunkers,enemies,sources){
  for(const name of ["reserveSpear", "reserveSword", "reserveArcher", "reserveHeavy"]){
    const value = Number(settings[name]);
    if(!Number.isInteger(value) || value < 0) throw new Error("La riserva deve contenere numeri interi maggiori o uguali a zero.");
  }
  if(!Number.isFinite(settings.worldSpeed) || settings.worldSpeed <= 0) throw new Error("Velocità mondo deve essere maggiore di zero.");
  if(!Number.isFinite(settings.unitSpeed) || settings.unitSpeed <= 0) throw new Error("Modificatore unità deve essere maggiore di zero.");
  if(!bunkerRows.length) throw new Error("Inserisci almeno un bunker.");
  if(!bunkers.length) throw new Error("Attiva almeno un bunker.");
  if(bunkers.some(b => !Number.isFinite(b.target) || b.target <= 0)) throw new Error("Ogni bunker attivo deve avere quantità maggiore di zero.");
  if(bunkers.some(b => !b.arrival)) throw new Error("Ogni bunker attivo deve avere data e ora arrivo valide.");
  if(bunkers.some(b => !Number.isFinite(b.supportSlowdown) || b.supportSlowdown < 0 || b.supportSlowdown >= 100)) throw new Error("La riduzione velocità supporti deve essere vuota, 0, o un numero tra 1 e 99.");
  if(!enemies.length) throw new Error("Lista nemici statica vuota. Modifica STATIC_ENEMY_VILLAGES in app.js.");
  if(!sources.length) throw new Error("Nessun mittente attivo con truppe disponibili dopo la riserva.");

  const minPacket = Number(settings.minPacketWeight);
  if(settings.minPacketEnabled && (!Number.isFinite(minPacket) || minPacket <= 0)) throw new Error("Il peso minimo comando deve essere maggiore di zero.");

}

function sortSourcesForBunker(sources,bunker){
  return sources.slice().sort((a,b) => {
    const enemySort = b.enemyDistance - a.enemyDistance;
    if(enemySort) return enemySort;

    const bunkerSort = distance(b,bunker) - distance(a,bunker);
    if(bunkerSort) return bunkerSort;

    return b.weight - a.weight;
  });
}

function commandUnitRows(command){
  const rows = [];
  for(const unit of ["spear","sword","archer","heavy"]){
    if(!command.send[unit]) continue;
    rows.push({ unit, amount: command.send[unit], departure: command.deadlines[unit], command });
  }
  return rows;
}

function formatPlayerCommands(commands){
  const lines = [];
  const byPlayer = new Map();

  for(const command of commands){
    const player = command.player || "unknown player";
    if(!byPlayer.has(player)) byPlayer.set(player, []);
    byPlayer.get(player).push(command);
  }

  for(const [player, playerCommands] of [...byPlayer.entries()].sort((a,b) => a[0].localeCompare(b[0]))){
    lines.push(`[b]Player:[/b] [player]${player}[/player]`);
    lines.push("");
    for(const command of playerCommands){
      lines.push(`${command.sourceCoord} -> ${command.bunkerCoord}`);
      if(command.supportUrl) lines.push(`[url=${command.supportUrl}]Support[/url]`);
      if(command.send.spear) lines.push(formatUnitSendLine(command.send.spear, "spear", command.deadlines.spear));
      if(command.send.sword) lines.push(formatUnitSendLine(command.send.sword, "sword", command.deadlines.sword));
      if(command.send.archer) lines.push(formatUnitSendLine(command.send.archer, "archer", command.deadlines.archer));
      if(command.send.heavy) lines.push(formatUnitSendLine(command.send.heavy, "heavy", command.deadlines.heavy));
      lines.push(`Peso: ${command.sentWeight}`);
      lines.push(`Distanza nemico: ${command.enemyDistance.toFixed(2)}`);
      lines.push("");
    }
  }

  return lines;
}

function formatUnitCommands(commands){
  const lines = [];

  for(const unit of ["spear","sword","archer","heavy"]){
    const rows = commands.flatMap(commandUnitRows).filter(row => row.unit === unit);
    if(!rows.length) continue;
    rows.sort((a,b) => a.departure - b.departure || a.command.player.localeCompare(b.command.player));

    lines.push(`[b]${UNIT_TW_LABEL[unit].toUpperCase()}[/b]`);
    for(const row of rows){
      const command = row.command;
      lines.push(`${command.sourceCoord} ([player]${command.player || "unknown player"}[/player]) -> ${command.bunkerCoord}`);
      lines.push(`${row.amount} ${UNIT_TW_LABEL[unit]} [unit]${unit}[/unit]`);
      lines.push(`Partenza: ${formatDateTime(row.departure)}`);
      lines.push(`Distanza nemico: ${command.enemyDistance.toFixed(2)}`);
      lines.push("");
    }
  }

  return lines;
}

function buildPlan(){
  const settings = getSettings();
  const enemies = parseCoords(STATIC_ENEMY_VILLAGES.join("\n"));
  const bunkers = getActiveBunkers();
  const minPacket = settings.minPacketEnabled ? Math.round(Number(settings.minPacketWeight)) : 1;
  const roundingEnabled = Boolean(settings.minPacketRoundingEnabled);
  let sources = getActiveFriendlySources();

  sources = sources.map(source => ({
    ...source,
    enemyDistance: minDistanceToEnemies(source,enemies)
  }));

  validate(settings,bunkers,enemies,sources);

  const lines = [];
  const warnings = [];
  const allCommands = [];
  let totalSentWeight = 0;
  let totalMissing = 0;
  let commandCount = 0;
  let skippedSmallSources = 0;
  let smallFinalCommands = 0;
  const now = getItalyNow();

  for(const [bunkerIndex, bunker] of bunkers.entries()){
    let remaining = Math.round(bunker.target);
    let sentHere = 0;
    const bunkerCommands = [];

    if(bunkerIndex > 0){
      lines.push("=========================================");
      lines.push("");
    }

    lines.push(`[b]BUNKER[/b] ${bunker.coord}`);
    lines.push("");
    lines.push(`Target: ${bunker.target}`);
    lines.push(`Arrivo: ${formatDateTime(bunker.arrival)}`);
    lines.push("");

    const sortedSources = sortSourcesForBunker(sources,bunker);
    for(const source of sortedSources){
      if(remaining <= 0) break;
      if(source.coord === bunker.coord || source.weight <= 0) continue;

      const sourcePlanWeight = effectiveWeight(source.weight, roundingEnabled);
      if(settings.minPacketEnabled && sourcePlanWeight < minPacket && remaining >= minPacket){
        skippedSmallSources += 1;
        continue;
      }

      const wanted = Math.min(remaining, source.weight);
      const allowSmallFinal = settings.minPacketEnabled && remaining < minPacket;
      const { send, sentWeight } = takeDefense(source, wanted);
      if(sentWeight <= 0) continue;

      const deadlines = getUnitDeadlines(source,bunker,send,settings);
      const actualFutureWeight = removeExpiredUnits(source, send, deadlines, now);
      if(actualFutureWeight <= 0){
        continue;
      }

      const planWeight = effectiveWeight(actualFutureWeight, roundingEnabled);
      if(planWeight <= 0){
        restoreDefense(source,send);
        skippedSmallSources += 1;
        continue;
      }

      if(settings.minPacketEnabled && planWeight < minPacket && !allowSmallFinal){
        restoreDefense(source,send);
        skippedSmallSources += 1;
        continue;
      }

      if(settings.minPacketEnabled && planWeight < minPacket && allowSmallFinal){
        smallFinalCommands += 1;
      }

      remaining = Math.max(0, remaining - planWeight);
      sentHere += planWeight;
      totalSentWeight += planWeight;
      commandCount += 1;

      bunkerCommands.push({
        sourceCoord: source.coord,
        bunkerCoord: bunker.coord,
        bunkerId: bunker.id,
        player: source.player || "unknown player",
        send,
        sentWeight: planWeight,
        actualWeight: actualFutureWeight,
        deadlines,
        enemyDistance: source.enemyDistance,
        supportUrl: (typeof VILLAGE_ID_BY_COORD!== "undefined" && VILLAGE_ID_BY_COORD[source.coord] && VILLAGE_ID_BY_COORD[bunker.coord]) ? `game.php?village=${VILLAGE_ID_BY_COORD[source.coord]}&screen=place&target=${VILLAGE_ID_BY_COORD[bunker.coord]}` : null
      });
    }

    allCommands.push(...bunkerCommands);
    if(settings.outputSort === "unit"){
      lines.push(...formatUnitCommands(bunkerCommands));
    }else{
      lines.push(...formatPlayerCommands(bunkerCommands));
    }

    lines.push(`Totale inviato a ${bunker.coord}: ${sentHere}`);
    if(remaining > 0){
      totalMissing += remaining;
      const warning = `Bunker ${bunker.coord} non completato. Mancano ${remaining}.`;
      warnings.push(warning);
      lines.push(`[color=#b42318]${warning}[/color]`);
    }else{
      lines.push(`Mancante: 0`);
    }
    lines.push("");
  }


  return {
    commands: allCommands,
    text: lines.join("\n"),
    summary: `${commandCount} comandi, ${totalSentWeight} peso difesa assegnato${totalMissing ? `, ${totalMissing} mancante` : ""}.`,
    warnings
  };
}

function showError(message){
  els.errorBox.textContent = message;
  els.errorBox.hidden = false;
}

function clearError(){
  els.errorBox.textContent = "";
  els.errorBox.hidden = true;
}

function showWarnings(warnings){
  els.warningsBox.innerHTML = "";
  els.warningsBox.hidden = !warnings.length;
  if(!warnings.length) return;
  const list = document.createElement("ul");
  for(const warning of warnings){
    const item = document.createElement("li");
    item.textContent = warning;
    list.appendChild(item);
  }
  els.warningsBox.appendChild(list);
}

function calculate(){
  try{
    clearError();
    const plan = buildPlan();
    els.resultBox.value = plan.text;
    els.summaryBox.textContent = plan.summary;
    showWarnings(plan.warnings);
    mapCommands = plan.commands;
    mapPlanReady = true;
    planSnapshot = JSON.stringify(getSettings());
    window.refreshVillageMap?.();
  }catch(err){
    mapCommands = [];
  mapPlanReady = false;
    window.refreshVillageMap?.();
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    showWarnings([]);
    showError(err.message);
  }
}

function updateConfirmationState(){
  document.getElementById("confirmAllBtn").disabled = !mapPlanReady || !mapCommands.length;
  const totals = Object.values(confirmedSent).reduce((sum, row) => {
    for(const unit of ["spear", "sword", "archer", "heavy"]) sum[unit] += row[unit];
    return sum;
  }, {spear:0, sword:0, archer:0, heavy:0});
  const weight = availableWeight(totals);
  document.getElementById("confirmedStatus").textContent = weight > 0
    ? `Invii convalidati: ${totals.spear.toLocaleString("it-IT")} lance, ${totals.sword.toLocaleString("it-IT")} spade, ${totals.archer.toLocaleString("it-IT")} arcieri, ${totals.heavy.toLocaleString("it-IT")} cavallerie pesanti.` : "";
}

function confirmAllCommands(){
  if(!mapPlanReady || !mapCommands.length) return;
  if(planSnapshot !== JSON.stringify(getSettings())){
    persist();
    showError("La configurazione è cambiata. Premi Calcola prima di convalidare.");
    return;
  }
  const commands = mapCommands.slice();
  const assigned = new Map();
  for(const command of commands){
    const units = confirmedSent[command.sourceCoord] ||= {spear:0,sword:0,archer:0,heavy:0};
    for(const unit of ["spear", "sword", "archer", "heavy"]) units[unit] += command.send[unit];
    assigned.set(command.bunkerId, (assigned.get(command.bunkerId) || 0) + command.sentWeight);
  }
  for(const bunker of bunkerRows){
    if(!assigned.has(bunker.id)) continue;
    bunker.target = String(Math.max(0, Number(bunker.target) - assigned.get(bunker.id)));
    if(Number(bunker.target) === 0) bunker.enabled = false;
  }
  renderBunkerTable();
  renderTroopTable();
  persist();
  els.resultBox.value = "";
  els.summaryBox.textContent = `${commands.length} invii convalidati. Disponibilità aggiornate.`;
  showWarnings([]);
  clearError();
  updateConfirmationState();
}

async function writeClipboard(text){
  await navigator.clipboard.writeText(text);
}

function compactExport(text){
  if(!text) return "";
  const quote = value => `"${String(value).replace(/"/g, '""')}"`;
  return "Coords,Player,spear,sword,archer,heavy\n" + parseTroops(text, true)
    .map(row => [row.coord, quote(row.player), row.spear, row.sword, row.archer, row.heavy].join(",")).join("\n");
}

function getSharedSettings(){
  const settings = getSettings();
  if(!settings.troopCsv || !settings.defenseCsv){
    return {...settings, bunkers: settings.bunkers.map(({id, ...row}) => row),
      friendlyRows: settings.friendlyRows.map(({id, ...row}) => row)};
  }
  const own = new Map(parseTroops(settings.troopCsv, true).map(row => [row.coord, row]));
  const defenses = new Map(parseTroops(settings.defenseCsv, true).map(row => [row.coord, row]));
  const players = [], playerIds = new Map();
  const playerId = name => {
    if(!playerIds.has(name)){playerIds.set(name, players.length); players.push(name);}
    return playerIds.get(name);
  };
  const packedCoord = coord => {const [x,y] = coord.split("|").map(Number);return x * 1000 + y;};
  const villages = [...new Set([...own.keys(), ...defenses.keys()])].map(coord => {
    const troop = own.get(coord), defense = defenses.get(coord);
    const base = [troop?.spear || 0, troop?.sword || 0, troop?.archer || 0, troop?.heavy || 0];
    const row = [packedCoord(coord), troop ? playerId(troop.player) : -1, ...base];
    if(!defense){row.push(null);return row;}
    const delta = [defense.spear-base[0], defense.sword-base[1], defense.archer-base[2], defense.heavy-base[3]];
    if(delta.some(n=>n!==0) || !troop || defense.player!==troop.player){
      row.push(...delta);
      if(!troop || defense.player!==troop.player) row.push(playerId(defense.player));
    }
    return row;
  });
  const selected = new Set(settings.friendlyRows.map(row=>row.coord));
  const possible = estimateFriendlyRows(settings.troopCsv, settings.defenseCsv);
  const result = {...settings, setupFormat:4, players, villages,
    disabled: settings.friendlyRows.filter(row=>!row.enabled).map(row=>packedCoord(row.coord)),
    removed: possible.filter(row=>!selected.has(row.coord)).map(row=>packedCoord(row.coord)),
    bunkers: settings.bunkers.map(({id, ...row}) => row)};
  delete result.troopCsv;
  delete result.defenseCsv;
  delete result.friendlyRows;
  return result;
}

function expandSharedSettings(settings){
  if(settings.setupFormat === 3 || settings.setupFormat === 4){
    const modern = settings.setupFormat === 4;
    const count = modern ? 4 : 3;
    const offset = 2 + count;
    const coord = value => `${Math.floor(value/1000)}|${value%1000}`;
    const quote = value => `"${String(value).replace(/"/g, '""')}"`;
    const own = [], defense = [];
    for(const row of settings.villages){
      const c = coord(row[0]), units = row.slice(2,offset);
      if(row[1] >= 0) own.push([c, quote(settings.players[row[1]]), ...units].join(","));
      if(row[offset] !== null){
        const pid = row[offset + count] ?? row[1];
        defense.push([c, quote(settings.players[pid]), ...units.map((n,i)=>n+(row[offset+i] || 0))].join(","));
      }
    }
    const header = modern ? "Coords,Player,spear,sword,archer,heavy\n" : "Coords,Player,spear,sword,heavy\n";
    const troopCsv = header + own.join("\n"), defenseCsv = header + defense.join("\n");
    const disabled = new Set((settings.disabled || []).map(coord)), removed = new Set((settings.removed || []).map(coord));
    const friendlyRows = estimateFriendlyRows(troopCsv, defenseCsv).filter(row=>!removed.has(row.coord))
      .map(row=>({...row, enabled:!disabled.has(row.coord)}));
    const result = {...settings, troopCsv, defenseCsv, friendlyRows};
    for(const key of ["setupFormat", "players", "villages", "disabled", "removed"]) delete result[key];
    return result;
  }
  if(settings.setupFormat !== 2) return settings;
  const selection = new Map(settings.friendlySelection || []);
  const rows = settings.friendlyData || estimateFriendlyRows(settings.troopCsv, settings.defenseCsv);
  const friendlyRows = rows.filter(row => selection.has(row.coord))
    .map(row => ({...row, enabled: Boolean(selection.get(row.coord))}));
  const result = {...settings, friendlyRows};
  delete result.setupFormat;
  delete result.friendlySelection;
  delete result.friendlyData;
  return result;
}

async function encodeSettings(){
  const json = JSON.stringify(getSharedSettings());
  if(typeof CompressionStream === "undefined") return btoa(unescape(encodeURIComponent(json)));
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for(let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return "TWZ1:" + btoa(binary);
}

async function decodeSettings(text){
  const trimmed = text.trim();
  if(trimmed.startsWith("TWZ1:")){
    if(typeof DecompressionStream === "undefined") throw new Error("Apri il setup con una versione aggiornata di Chrome, Edge o Firefox.");
    const binary = atob(trimmed.slice(5).replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return expandSharedSettings(JSON.parse(await new Response(stream).text()));
  }
  try{
    return expandSharedSettings(JSON.parse(decodeURIComponent(escape(atob(trimmed)))));
  }catch(_err){
    return expandSharedSettings(JSON.parse(trimmed));
  }
}

function loadSaved(){
  setSettings({
    worldSpeed: 1,
    unitSpeed: 1,
    minPacketEnabled: false,
    minPacketWeight: 1000,
    minPacketRoundingEnabled: false,
    outputSort: "player",
    friendlyRows: []
  });
}

function bind(){
  document.getElementById("confirmAllBtn").addEventListener("click", confirmAllCommands);
  document.getElementById("downloadSetupBtn").addEventListener("click", async () => {
    const text = await encodeSettings();
    const url = URL.createObjectURL(new Blob([text], {type: "text/plain"}));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bunker-setup.twsetup";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById("setupFileInput").addEventListener("change", async event => {
    const file = event.target.files[0];
    if(file) els.settingsImport.value = await file.text();
  });
  document.getElementById("existingBunkerBody").addEventListener("change", event => {
    const coord = event.target.dataset.mapCoord;
    if(!coord) return;
    if(event.target.checked) hiddenExistingBunkers.delete(coord);
    else hiddenExistingBunkers.add(coord);
    window.refreshVillageMap?.();
  });
  document.getElementById("addBunkersBtn").addEventListener("click", addBunkersFromInput);

  els.bunkerTableBody.addEventListener("input", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = bunkerRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    const field = event.target.dataset.field;
    if(field === "target") row.target = event.target.value;
    if(field === "arrival") row.arrival = event.target.value;
    if(field === "supportSlowdown") row.supportSlowdown = event.target.value;
    persist();
  });

  els.bunkerTableBody.addEventListener("change", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = bunkerRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    if(event.target.dataset.field === "enabled") row.enabled = event.target.checked;
    persist();
  });

  els.bunkerTableBody.addEventListener("click", event => {
    if(event.target.dataset.action !== "remove") return;
    const tr = event.target.closest("tr");
    bunkerRows = bunkerRows.filter(item => item.id !== tr.dataset.id);
    renderBunkerTable();
    persist();
  });

  document.getElementById("loadTroopsBtn").addEventListener("click", () => {
    els.troopCsv.value = importedTroops;
    document.getElementById("troopImportError").hidden = true;
    document.getElementById("troopImportDialog").showModal();
  });
  document.getElementById("openDefensesBtn").addEventListener("click", () => {
    document.getElementById("defenseCsv").value = importedDefenses;
    document.getElementById("defenseImportError").hidden = true;
    document.getElementById("defenseImportDialog").showModal();
  });
  document.getElementById("applyTroopsBtn").addEventListener("click", () => applyTroopExport("troops"));
  document.getElementById("applyDefensesBtn").addEventListener("click", () => applyTroopExport("defenses"));
  for(const id of ["reserveSpear", "reserveSword", "reserveArcher", "reserveHeavy"]){
    document.getElementById(id).addEventListener("input", () => {renderTroopTable(); persist();});
  }

  els.troopTableBody.addEventListener("change", event => {
    const tr = event.target.closest("tr");
    if(!tr) return;
    const row = friendlyRows.find(item => item.id === tr.dataset.id);
    if(!row) return;
    if(event.target.dataset.field === "enabled") row.enabled = event.target.checked;
    persist();
  });

  els.troopTableBody.addEventListener("click", event => {
    if(event.target.dataset.action !== "remove") return;
    const tr = event.target.closest("tr");
    friendlyRows = friendlyRows.filter(item => item.id !== tr.dataset.id);
    renderTroopTable();
    persist();
  });

  document.getElementById("calcBtn").addEventListener("click", calculate);
  document.getElementById("copyResultBtn").addEventListener("click", async () => {
    calculate();
    if(els.resultBox.value) await writeClipboard(els.resultBox.value);
  });
  document.getElementById("copySettingsBtn").addEventListener("click", async () => {
    await writeClipboard(await encodeSettings());
  });
  document.getElementById("pasteSettingsBtn").addEventListener("click", () => {
    els.settingsImport.value = "";
    els.settingsDialog.showModal();
  });
  document.getElementById("applySettingsBtn").addEventListener("click", async () => {
    try{
      setSettings(await decodeSettings(els.settingsImport.value));
      els.settingsDialog.close();
      calculate();
    }catch(err){
      alert(`Import setup fallito: ${err.message}`);
    }
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    if(!confirm("Vuoi davvero cancellare tutta la configurazione?")) return;
    window.tableTools?.resetAll();
    bunkerRows = [];
    friendlyRows = [];
    setSettings({
      worldSpeed: 1,
      unitSpeed: 1,
      defaultBunkerTarget: "",
      defaultBunkerArrival: "",
      outputSort: "player",
      troopCsv: "",
      minPacketEnabled: false,
      minPacketWeight: 1000,
      minPacketRoundingEnabled: false,
      bunkers: [],
      friendlyRows: []
    });
    els.bunkerCoordsInput.value = "";
    els.resultBox.value = "";
    els.summaryBox.textContent = "";
    showWarnings([]);
    clearError();
  });

  for(const element of [els.worldSpeed,els.unitSpeed,els.defaultBunkerTarget,els.defaultBunkerArrival,els.outputSort,els.minPacketEnabled,els.minPacketWeight,els.minPacketRoundingEnabled]){
    element.addEventListener("input", persist);
  }
}

loadSaved();
bind();


function getExistingBunkers(){
  if(!importedTroops || !importedDefenses) return [];
  const own = new Map(parseTroops(importedTroops, true).map(row => [row.coord, row]));
  return parseTroops(importedDefenses, true).flatMap(defense => {
    const troop = own.get(defense.coord);
    if(!troop) return [];
    const surplus = {spear: Math.max(0, defense.spear - troop.spear), sword: Math.max(0, defense.sword - troop.sword), archer: Math.max(0, defense.archer - troop.archer), heavy: Math.max(0, defense.heavy - troop.heavy)};
    const weight = availableWeight(surplus);
    return weight > 0 ? [{...defense, surplus, surplusWeight: weight, own: troop}] : [];
  }).sort((a,b) => b.surplusWeight - a.surplusWeight);
}

function renderExistingBunkers(){
  const allRows = getExistingBunkers();
  const rows = window.tableTools?.apply("existing", allRows) || allRows;
  window.tableTools?.update("existing", allRows, rows);
  const body = document.getElementById("existingBunkerBody");
  body.replaceChildren();
  for(const row of rows){
    const tr = document.createElement("tr");
    const visibility = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !hiddenExistingBunkers.has(row.coord);
    checkbox.dataset.mapCoord = row.coord;
    checkbox.setAttribute("aria-label", `Mostra ${row.coord} nella mappa`);
    visibility.appendChild(checkbox);
    tr.appendChild(visibility);
    for(const value of [row.coord, row.player, row.surplus.spear, row.surplus.sword, row.surplus.archer, row.surplus.heavy, row.surplusWeight, row.weight]){
      const td = document.createElement("td");
      td.textContent = typeof value === "number" ? value.toLocaleString("it-IT") : value;
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  document.getElementById("existingBunkerStatus").textContent = importedTroops && importedDefenses
    ? `${allRows.length} bunker esistenti. Peso supporti: ${allRows.reduce((n,row) => n + row.surplusWeight, 0).toLocaleString("it-IT")}.`
    : "Carica entrambi gli export nella sezione Truppe amiche.";
}
