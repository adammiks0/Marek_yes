#!/bin/bash

# Token autoryzacyjny
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjY4NTg1NTEsImlkIjowfQ.K6n3MWoBhiStqAAq6NTX6xY5T2teK4IIRY-fnk2PQNs"

# 1. Luksusowy dom w górach
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=dom" \
  -F "type=nieruchomość luksusowa" \
  -F "status=false" \
  -F "localization=Wisła" \
  -F "surface=250" \
  -F "price=1200000" \
  -F "opis=Ekskluzywny dom z panoramą Beskidów, 5 sypialni, sauna, jacuzzi. Wykończenie premium."

# 2. Działka budowlana pod Krakowem
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=działka budowlana" \
  -F "status=false" \
  -F "localization=Skawina" \
  -F "surface=1000" \
  -F "price=280000" \
  -F "opis=Działka z mediami, blisko Krakowa. Idealna pod budowę domu jednorodzinnego."

# 3. Mieszkanie w centrum Katowic
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=mieszkanie" \
  -F "status=false" \
  -F "localization=Katowice Centrum" \
  -F "surface=65" \
  -F "price=420000" \
  -F "opis=Nowoczesne mieszkanie 3-pokojowe, 8 piętro, balkon. Blisko metra."

# 4. Kamienica w Cieszynie
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=kamienica" \
  -F "type=nieruchomość zabytkowa" \
  -F "status=false" \
  -F "localization=Cieszyn" \
  -F "surface=380" \
  -F "price=890000" \
  -F "opis=Zabytkowa kamienica z 1910 roku, po renowacji. 4 lokale + lokal użytkowy."

# 5. Apartament w Zakopanem - SPRZEDANY
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=apartament" \
  -F "type=nieruchomość turystyczna" \
  -F "status=true" \
  -F "localization=Zakopane" \
  -F "surface=45" \
  -F "price=580000" \
  -F "opis=Apartament 100m od Krupówek. Świetna inwestycja pod wynajem."

# 6. Dom z warsztatem
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=dom" \
  -F "type=nieruchomość komercyjna" \
  -F "status=false" \
  -F "localization=Bielsko-Biała" \
  -F "surface=180" \
  -F "price=650000" \
  -F "opis=Dom z warsztatem samochodowym 120m². Idealne na działalność gospodarczą."

# 7. Mały dom na wsi
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=dom" \
  -F "status=false" \
  -F "localization=Istebna" \
  -F "surface=85" \
  -F "price=320000" \
  -F "opis=Drewniany dom góralski, klimatyczny, z ogrodem 800m². Do lekkiego remontu."

# 8. Duża działka leśna
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=działka leśna" \
  -F "status=false" \
  -F "localization=Brenna" \
  -F "surface=5000" \
  -F "price=450000" \
  -F "opis=Działka rekreacyjna w lesie, możliwość budowy domku letniskowego."

# 9. Kawalerka dla studenta
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=mieszkanie" \
  -F "type=kawalerka" \
  -F "status=false" \
  -F "localization=Katowice Ligota" \
  -F "surface=28" \
  -F "price=245000" \
  -F "opis=Kawalerka blisko uczelni, niskie opłaty, świetna na wynajem studencki."

# 10. Loft w starej fabryce
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=mieszkanie" \
  -F "type=loft" \
  -F "status=false" \
  -F "localization=Katowice Nikiszowiec" \
  -F "surface=110" \
  -F "price=620000" \
  -F "opis=Industrialny loft, wysokość 4m, otwarta przestrzeń. Unikalne wnętrze."

# 11. Pensjonat w górach
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=pensjonat" \
  -F "type=nieruchomość komercyjna" \
  -F "type=nieruchomość turystyczna" \
  -F "status=false" \
  -F "localization=Szczyrk" \
  -F "surface=450" \
  -F "price=2100000" \
  -F "opis=Pensjonat 15 pokoi, restauracja, parking. Pełne obłożenie przez cały rok."

# 12. Działka rolna
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=działka rolna" \
  -F "status=false" \
  -F "localization=Jastrzębie-Zdrój" \
  -F "surface=8000" \
  -F "price=320000" \
  -F "opis=Działka rolna, teren płaski, dostęp do drogi. Możliwość zmiany przeznaczenia."

# 13. Mieszkanie z tarasem - SPRZEDANE
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=mieszkanie" \
  -F "status=true" \
  -F "localization=Wisła" \
  -F "surface=75" \
  -F "price=520000" \
  -F "opis=Mieszkanie z tarasem 30m², widok na Baranią Górę. Garaż w cenie."

# 14. Dom szeregowy
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=dom" \
  -F "type=dom szeregowy" \
  -F "status=false" \
  -F "localization=Czechowice-Dziedzice" \
  -F "surface=120" \
  -F "price=485000" \
  -F "opis=Nowy dom w zabudowie szeregowej, ogródek 150m². Stan deweloperski."

# 15. Lokal użytkowy
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=lokal użytkowy" \
  -F "type=nieruchomość komercyjna" \
  -F "status=false" \
  -F "localization=Bielsko-Biała Centrum" \
  -F "surface=95" \
  -F "price=680000" \
  -F "opis=Lokal na parterze, witryna, idealne na sklep lub biuro. Ruchliwa ulica."

# 16. Willa z basenem
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=dom" \
  -F "type=nieruchomość luksusowa" \
  -F "status=false" \
  -F "localization=Ustroń" \
  -F "surface=320" \
  -F "price=1850000" \
  -F "opis=Willa z basenem krytym, siłownia, 6 sypialni, działka 2000m². Luksus i prywatność."

# 17. Stara stodoła do remontu
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=stodoła" \
  -F "status=false" \
  -F "localization=Koniaków" \
  -F "surface=150" \
  -F "price=180000" \
  -F "opis=Stara stodoła z potencjałem, działka 1200m². Idealna na adaptację na dom."

# 18. Apartament z widokiem na Tatry - SPRZEDANY
curl -X POST http://localhost:8080/api/admin/estates \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=apartament" \
  -F "type=nieruchomość luksusowa" \
  -F "status=true" \
  -F "localization=Zakopane" \
  -F "surface=88" \
  -F "price=920000" \
  -F "opis=Penthouse z panoramą Tatr, kominek, 2 tarasy. Garaż podziemny."

echo ""
echo "✅ Dodano 18 przykładowych nieruchomości!"
