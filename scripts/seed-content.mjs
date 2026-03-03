import 'dotenv/config.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) environment variable');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const stories = [
    {
        id: "e35048ae-929f-450c-b306-e27632d73eed",
        title: "Si Kancil dan Buaya",
        content: "Pada suatu hari, Si Kancil ingin menyeberangi sungai yang penuh buaya. Si Kancil yang cerdik kemudian berkata kepada buaya-buaya, \"Hai Buaya, Raja hutan ingin menghitung berapa jumlah kalian. Bisakah kalian berbaris dari tepi ke tepi sungai?\"\n\nBuaya-buaya yang bangga pun segera berbaris membentuk jembatan. Si Kancil dengan cerdik melompat dari satu punggung buaya ke buaya lainnya sambil berpura-pura menghitung. \"Satu, dua, tiga...\"\n\nKetika sampai di seberang, Si Kancil berteriak, \"Terima kasih, Buaya! Aku sudah menyeberang!\" Buaya-buaya baru menyadari bahwa mereka telah ditipu oleh Si Kancil yang cerdik.\n\nPesan Moral: Kecerdasan dan kreativitas dapat membantu kita mengatasi tantangan.",
        age_category: "4-6",
        theme: "Fabel",
        image_url: "https://images.pexels.com/photos/86596/owl-bird-eyes-eagle-owl-86596.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    },
    {
        id: "7a4a3da4-5ebc-4d65-ac59-79cee5a3f2c4",
        title: "Timun Mas",
        content: "Di sebuah desa, hiduplah seorang janda tua yang sangat ingin memiliki anak. Suatu hari, seorang raksasa memberinya biji timun ajaib dengan syarat anak yang lahir harus diserahkan saat berusia 17 tahun.\n\nLahirlah seorang gadis cantik dari timun emas yang dinamakan Timun Mas. Saat usia 17 tahun tiba, raksasa datang menagih janji. Ibu Timun Mas memberinya empat bungkusan ajaib: biji mentimun, jarum, garam, dan terasi.\n\nTimun Mas berlari melarikan diri. Ketika raksasa hampir menangkapnya, ia melempar biji mentimun yang berubah menjadi hutan lebat. Raksasa terus mengejar. Timun Mas melempar jarum yang berubah menjadi bambu runcing. Lalu garam yang menjadi lautan, dan terasi yang menjadi lumpur mendidih yang menenggelamkan raksasa.\n\nTimun Mas selamat dan hidup bahagia bersama ibunya.\n\nPesan Moral: Keberanian dan ketabahan dapat mengalahkan kejahatan.",
        age_category: "7-12",
        theme: "Legenda",
        image_url: "https://images.pexels.com/photos/1415558/pexels-photo-1415558.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    },
    {
        id: "ab427d54-a7d7-4b1b-a9f4-5a1b4e2fc0e9",
        title: "Kucing dan Tikus Kecil",
        content: "Seekor tikus kecil sedang bermain di hutan ketika tanpa sengaja menginjak kaki seekor kucing yang sedang tidur. Kucing terbangun dan marah, ia menangkap tikus kecil itu.\n\n\"Tolong jangan makan aku!\" pinta tikus. \"Suatu hari nanti aku akan membalas kebaikanmu!\"\n\nKucing tertawa. \"Bagaimana mungkin tikus kecil sepertimu bisa membantuku?\" Tapi karena hatinya baik, kucing melepaskan tikus tersebut.\n\nBeberapa hari kemudian, kucing terjebak dalam jaring pemburu. Ia meraung-raung meminta tolong. Tikus kecil yang mendengar suaranya segera datang dan menggerogoti tali jaring hingga kucing terbebas.\n\n\"Terima kasih, Tikus kecil,\" kata kucing. \"Aku salah meremehkanmu.\"\n\nPesan Moral: Tidak ada kebaikan yang sia-sia. Bahkan makhluk terkecil pun bisa memberikan bantuan besar.",
        age_category: "4-6",
        theme: "Fabel",
        image_url: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    },
    {
        id: "c12d5010-8e82-4473-9dba-f14cce00339a",
        title: "Pelangi dan Hujan",
        content: "Dulu kala, Pelangi dan Hujan adalah sahabat baik. Mereka selalu bermain bersama di langit. Hujan suka menyiram bumi dengan tetesan airnya, sementara Pelangi suka menari di langit dengan warna-warni indahnya.\n\nSuatu hari, mereka bertengkar karena berebut waktu untuk tampil di langit. Hujan ingin terus turun, sementara Pelangi ingin segera muncul. Mereka tidak mau saling berbagi.\n\nMatabu yang bijaksana berkata, \"Kalian berdua penting. Tanpa Hujan, tanaman tidak akan tumbuh. Tanpa Pelangi, langit tidak akan indah. Mengapa tidak bekerja sama?\"\n\nAkhirnya Hujan dan Pelangi berdamai. Sejak saat itu, Pelangi selalu muncul setelah Hujan turun, menciptakan pemandangan terindah di langit. Mereka belajar bahwa bekerja sama lebih baik daripada bertengkar.\n\nPesan Moral: Kerja sama dan berbagi membuat segalanya lebih indah.",
        age_category: "0-3",
        theme: "Fantasi",
        image_url: "https://images.pexels.com/photos/1089305/pexels-photo-1089305.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    },
    {
        id: "f9ced47c-83ed-4040-b9d8-0b2383548861",
        title: "Burung Rajawali dan Anak Ayam",
        content: "Seekor burung rajawali yang gagah terbang tinggi di langit. Suatu hari, ia melihat sekawanan anak ayam bermain di tanah. Rajawali tertawa mengejek, \"Kalian tidak bisa terbang tinggi seperti aku!\"\n\nSeorang ayam tua berkata, \"Memang benar kami tidak bisa terbang setinggimu. Tapi kami bisa mencari makanan sendiri dan membantu petani. Setiap makhluk punya kelebihannya masing-masing.\"\n\nRajawali merenungkan kata-kata ayam tua tersebut. Ia menyadari bahwa terbang tinggi memang kemampuannya, tapi itu tidak membuat dirinya lebih baik dari makhluk lain. Setiap makhluk diciptakan dengan keunikan dan kelebihan masing-masing.\n\nSejak hari itu, Rajawali tidak lagi sombong. Ia menghargai setiap makhluk, baik yang bisa terbang tinggi maupun yang berjalan di tanah.\n\nPesan Moral: Jangan sombong dengan kelebihanmu. Setiap orang memiliki kelebihan yang berbeda-beda.",
        age_category: "4-6",
        theme: "Fabel",
        image_url: "https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    },
    {
        id: "af40a824-c377-404c-90c6-bd9e9e185c9a",
        title: "Bintang Kecil yang Malu",
        content: "Di langit malam yang luas, tinggal sebuah bintang kecil yang sangat malu. Ia merasa cahayanya tidak secemerlang bintang-bintang lain. Setiap malam, bintang kecil bersembunyi di balik awan.\n\nBulan yang bijaksana bertanya, \"Mengapa kamu bersembunyi, Bintang Kecil?\"\n\n\"Cahayaku terlalu kecil, Bu Bulan. Aku malu,\" jawab bintang kecil.\n\n\"Lihat ke bawah,\" kata Bulan. Bintang kecil melihat seorang anak kecil yang tersesat di hutan gelap. Hanya cahaya bintang kecil yang bisa menerangi jalannya pulang.\n\n\"Cahayamu mungkin kecil, tapi sangat berarti bagi anak itu. Tidak ada cahaya yang terlalu kecil untuk bersinar,\" kata Bulan.\n\nSejak hari itu, bintang kecil tidak lagi malu. Ia bersinar dengan bangga setiap malam, menyadari bahwa setiap cahaya, sekecil apapun, sangat berarti.\n\nPesan Moral: Jangan pernah meremehkan diri sendiri. Setiap orang punya nilai dan bisa membuat perbedaan.",
        age_category: "0-3",
        theme: "Fantasi",
        image_url: "https://images.pexels.com/photos/1567069/pexels-photo-1567069.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2026-02-24T05:38:24.253839+00:00"
    }
];

const mpasiRecipes = [
    {
        id: "68af3b38-1952-49c5-8e8f-29c4a5998fc9",
        title: "Bubur Beras Putih Sederhana",
        age_group: "6-8",
        category: "Puree",
        ingredients: "Beras putih 100g, Air 500ml, Garam secukupnya",
        instructions: "Cuci beras hingga bersih\nMasak beras dengan air hingga menjadi bubur lembut\nSajikan selagi hangat\nBisa disimpan dalam freezer hingga 3 bulan",
        nutrition_info: "Karbohidrat kompleks, mudah dicerna, cocok untuk makanan pertama bayi",
        allergenic_warning: "Bebas alergen umum",
        prep_time_minutes: 20,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "5ee0c78c-e63f-4f93-84d3-915b25c5f6cd",
        title: "Bubur Sayur dan Beras Merah",
        age_group: "6-8",
        category: "Puree",
        ingredients: "Beras merah 50g, Wortel 50g, Labu kuning 50g, Air 300ml, Garam secukupnya",
        instructions: "Kupas dan potong sayuran kecil-kecil\nCuci beras merah\nMasak bersama hingga empuk dan berubah menjadi bubur\nSaring atau haluskan jika diperlukan\nSajikan hangat",
        nutrition_info: "Serat tinggi, vitamin A, mineral, mudah dicerna",
        allergenic_warning: "Bebas alergen umum",
        prep_time_minutes: 25,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "819925cc-258e-4fe0-a7b9-a7b4163aadd5",
        title: "Pure Ubi Jalar Manis",
        age_group: "6-8",
        category: "Puree",
        ingredients: "Ubi jalar merah 150g, Air secukupnya",
        instructions: "Pilih ubi jalar yang mulus dan tidak ada bagian gelap\nCuci bersih dan kupas\nPotong dadu kecil\nKukus selama 15-20 menit hingga sangat empuk\nHaluskan atau saring hingga lembut\nTambah air jika terlalu kental",
        nutrition_info: "Beta karoten, vitamin C, serat, kaya kalori",
        allergenic_warning: "Bebas alergen umum",
        prep_time_minutes: 25,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "76758dbb-24ef-4c76-86ad-f6b2a64f0344",
        title: "Nasi Tim Sayuran dan Hati",
        age_group: "8-10",
        category: "Porridge",
        ingredients: "Nasi putih 75g, Hati ayam 30g, Brokoli 30g, Wortel 30g, Air 200ml, Minyak zaitun 1 sdt, Garam sedikit",
        instructions: "Cuci hati ayam dan potong kecil-kecil\nPotong sayuran halus\nMasak nasi setengah matang dengan air\nTambahkan hati ayam dan sayuran\nMasak hingga semua lembut\nAduk rata dan tambahkan minyak zaitun",
        nutrition_info: "Zat besi tinggi, protein, vitamin A, B6",
        allergenic_warning: "Dapat mengandung protein tinggi - mulai dengan porsi kecil",
        prep_time_minutes: 25,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "2f3843ea-19cd-4c81-b735-91574644cd8b",
        title: "Bubur Ayam Lembut",
        age_group: "8-10",
        category: "Puree",
        ingredients: "Daging ayam tanpa lemak 50g, Beras putih 50g, Wortel 30g, Bawang putih 1 siung kecil, Kaldu ayam 250ml, Garam secukupnya",
        instructions: "Bersihkan daging ayam dan potong kecil-kecil\nCuci beras hingga bersih\nMasak beras dengan kaldu ayam hingga setengah matang\nTambahkan daging ayam dan sayuran\nMasak hingga semua empuk\nHaluskan dengan garpu atau mixer\nSaring jika perlu untuk tekstur yang lebih halus",
        nutrition_info: "Protein tinggi, zat besi, vitamin B12, mudah dicerna",
        allergenic_warning: "Dapat mengandung gluten dari kaldu",
        prep_time_minutes: 30,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "9e6fc1bb-e6d9-42c6-94bf-cb16983e3ce5",
        title: "Pure Daging Sapi dan Kentang",
        age_group: "8-10",
        category: "Puree",
        ingredients: "Daging sapi tanpa lemak 40g, Kentang 60g, Wortel 30g, Air 150ml, Garam secukupnya",
        instructions: "Pilih daging sapi berkualitas bagus, bersihkan dari lemak\nPotong dadu kecil dan cuci hingga air jernih\nKupas dan potong kentang serta wortel\nMasak daging dalam air hingga empuk (20-30 menit)\nTambahkan sayuran dan masak hingga lembut\nHaluskan dengan food processor atau mixer\nSaring untuk tekstur yang sempurna",
        nutrition_info: "Protein tinggi, zat besi, vitamin B12, seng",
        allergenic_warning: "Mulai dengan porsi kecil karena protein tinggi",
        prep_time_minutes: 40,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "be3b1877-452f-4dbf-ab41-e3bb77927b6e",
        title: "Roti Panggang Telur dan Keju",
        age_group: "10-12",
        category: "Finger Food",
        ingredients: "Roti gandum 1 lembar, Telur 1 butir, Keju parut 20g, Mentega 1 sdt, Garam, Lada putih secukupnya",
        instructions: "Potong roti menjadi strip atau bentuk jari\nPanaskan mentega di wajan\nKocok telur dengan garam dan lada\nCelupkan roti ke dalam telur, pastikan terserap\nGoreng hingga golden brown di kedua sisi\nTaburkan keju sambil masih panas\nDinginkan sebelum disajikan",
        nutrition_info: "Protein, kalsium, vitamin D, karbohidrat kompleks",
        allergenic_warning: "Telur dan gluten - pastikan sudah pernah diberikan",
        prep_time_minutes: 15,
        servings: 2,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "7c070f58-3518-439e-b0ae-5aeedacc148f",
        title: "Bubur Ikan Laut dan Beras",
        age_group: "10-12",
        category: "Porridge",
        ingredients: "Ikan tenggiri 50g, Beras putih 50g, Kaldu ikan 200ml, Tomat 30g, Bayam 20g, Minyak kelapa 1 sdt",
        instructions: "Pilih ikan segar tanpa duri besar\nCuci bersih dan potong kecil-kecil, periksa tidak ada duri\nCuci beras dan masak dengan kaldu ikan\nSaat beras half-cook, tambahkan ikan, tomat, dan bayam\nMasak hingga semua lembut\nAduk rata, tambahkan minyak kelapa\nSajikan hangat",
        nutrition_info: "Omega-3, DHA, protein, kalsium, mineral dari laut",
        allergenic_warning: "Ikan - mulai dengan jenis yang jarang menyebabkan alergi",
        prep_time_minutes: 25,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "eeaa224a-d07c-4705-9ede-0b0485b75c74",
        title: "Puding Pisang Keju",
        age_group: "10-12",
        category: "Snack",
        ingredients: "Pisang matang 100g, Keju cottage 50g, Yogurt plain 75ml, Madu 1 sdt",
        instructions: "Pilih pisang yang cukup matang (kulit sedikit bintik coklat)\nPotong pisang dan haluskan dengan garpu\nCampur dengan keju cottage\nTambahkan yogurt plain dan aduk rata\nTambahkan madu untuk rasa\nSajikan langsung atau simpan dalam kulkas\nKonsumsi dalam 1-2 hari",
        nutrition_info: "Kalium, probiotik, kalsium, vitamin B6",
        allergenic_warning: "Produk susu - cek toleransi bayi",
        prep_time_minutes: 10,
        servings: 1,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    },
    {
        id: "8154b3f8-f75f-45c4-9c30-99e1e932829d",
        title: "Sup Sayuran Lembut",
        age_group: "10-12",
        category: "Soup",
        ingredients: "Brokoli 40g, Kembang kol 40g, Wortel 30g, Kentang 30g, Kaldu sayuran 300ml, Minyak zaitun 1 sdt",
        instructions: "Potong semua sayuran menjadi potongan kecil sama besar\nPanaskan kaldu sayuran\nMasak sayuran hingga sangat empuk (15-20 menit)\nHaluskan sebagian atau seluruhnya sesuai preferensi\nTambahkan minyak zaitun\nSajikan hangat\nBisa disimpan dalam kulkas selama 2-3 hari",
        nutrition_info: "Serat, vitamin C, mineral, mudah dicerna",
        allergenic_warning: "Bebas alergen umum jika hanya sayuran organik",
        prep_time_minutes: 20,
        servings: 2,
        created_at: "2026-02-28T04:00:54.604721+00:00"
    }
];

async function upsertByTitle(tableName, rows) {
  const { data: existingRows, error: fetchError } = await supabase
    .from(tableName)
    .select('id, title');

  if (fetchError) {
    throw fetchError;
  }

  const existingByTitle = new Map((existingRows ?? []).map((item) => [item.title, item.id]));

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const existingId = existingByTitle.get(row.title);

    if (existingId) {
      const { error } = await supabase
        .from(tableName)
        .update(row)
        .eq('id', existingId);
      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await supabase
        .from(tableName)
        .insert(row);
      if (error) throw error;
      inserted += 1;
    }
  }

  return { inserted, updated };
}

async function resetContent() {
  const { error: deleteStoriesError } = await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteStoriesError) throw deleteStoriesError;

  const { error: deleteRecipesError } = await supabase.from('mpasi_recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteRecipesError) throw deleteRecipesError;
}

async function main() {
  const shouldReset = process.argv.includes('--reset');

  console.log('🌱 Starting content seed...');

  if (shouldReset) {
    console.log('♻️ Reset mode enabled: clearing existing stories and mpasi_recipes...');
    await resetContent();
  }

  const storyResult = await upsertByTitle('stories', stories);
  const mpasiResult = await upsertByTitle('mpasi_recipes', mpasiRecipes);

  console.log(`✅ Stories seeded (inserted: ${storyResult.inserted}, updated: ${storyResult.updated})`);
  console.log(`✅ MPASI seeded (inserted: ${mpasiResult.inserted}, updated: ${mpasiResult.updated})`);
  console.log('🎉 Seeding complete.');
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error.message ?? error);
  process.exit(1);
});
