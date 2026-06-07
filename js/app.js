// Initialize Supabase Client
const { createClient } = window.supabase;
const supabaseUrl = 'https://qrqrycftkrbvyhuazebv.supabase.co';
const supabaseKey = 'sb_publishable_UELCHgI4yCcqaNJIhQiJDA_WBWGwflB';
const supabase = createClient(supabaseUrl, supabaseKey);

// Global State
let attendanceData = [];
let currentPage = 1;
let itemsPerPage = 5;
let searchQuery = "";
let sortBy = "tanggal";
let sortDirection = "desc";
let currentEditId = null;
let genderChartInstance = null;
let weeklyChartInstance = null;

// Profile Global State & Defaults
let profileData = {};
const defaultProfile = {
  nama: "Ahmad Syarifuddin",
  nip: "ADM-2026-001",
  email: "ahmad.admin@company.com",
  phone: "081234567890",
  department: "Human Resource Department (HRD)",
  bio: "Pengelola utama sistem absensi karyawan perusahaan."
};

// Indonesian Mock Data (Seeded if local storage is empty)
const mockData = [
  { id: "1", nama: "Budi Santoso", alamat: "Jl. Merdeka No. 10, Jakarta Pusat", jenis_kelamin: "Laki-laki", tanggal: "2026-06-01", jam_masuk: "07:45", jam_keluar: "17:05" },
  { id: "2", nama: "Siti Rahma", alamat: "Jl. Sudirman No. 45, Bandung", jenis_kelamin: "Perempuan", tanggal: "2026-06-01", jam_masuk: "08:02", jam_keluar: "17:00" },
  { id: "3", nama: "Joko Widodo", alamat: "Jl. Diponegoro No. 12, Surabaya", jenis_kelamin: "Laki-laki", tanggal: "2026-06-02", jam_masuk: "07:55", jam_keluar: "17:15" },
  { id: "4", nama: "Lestari Putri", alamat: "Jl. Mawar No. 3, Yogyakarta", jenis_kelamin: "Perempuan", tanggal: "2026-06-02", jam_masuk: "07:30", jam_keluar: "16:45" },
  { id: "5", nama: "Ahmad Fauzi", alamat: "Jl. Gajah Mada No. 8, Semarang", jenis_kelamin: "Laki-laki", tanggal: "2026-06-03", jam_masuk: "08:15", jam_keluar: "17:30" },
  { id: "6", nama: "Dewi Lestari", alamat: "Jl. Pemuda No. 14, Medan", jenis_kelamin: "Perempuan", tanggal: "2026-06-03", jam_masuk: "07:50", jam_keluar: "17:00" },
  { id: "7", nama: "Rian Hidayat", alamat: "Jl. Asia Afrika No. 22, Bandung", jenis_kelamin: "Laki-laki", tanggal: "2026-06-04", jam_masuk: "07:40", jam_keluar: "17:10" },
  { id: "8", nama: "Ani Wijaya", alamat: "Jl. Pahlawan No. 5, Surabaya", jenis_kelamin: "Perempuan", tanggal: "2026-06-04", jam_masuk: "08:05", jam_keluar: "17:00" },
  { id: "9", nama: "Bambang Hermawan", alamat: "Jl. Kartini No. 9, Solo", jenis_kelamin: "Laki-laki", tanggal: "2026-06-05", jam_masuk: "07:58", jam_keluar: "17:02" },
  { id: "10", nama: "Fitri Handayani", alamat: "Jl. Kusumanegara No. 88, Yogyakarta", jenis_kelamin: "Perempuan", tanggal: "2026-06-05", jam_masuk: "07:48", jam_keluar: "17:05" },
  { id: "11", nama: "Hendra Wijaya", alamat: "Jl. Sudirman No. 100, Jakarta Selatan", jenis_kelamin: "Laki-laki", tanggal: "2026-06-07", jam_masuk: "07:52", jam_keluar: "17:00" },
  { id: "12", nama: "Siska Amelia", alamat: "Jl. Pajajaran No. 23, Bogor", jenis_kelamin: "Perempuan", tanggal: "2026-06-07", jam_masuk: "08:10", jam_keluar: "16:55" }
];

// Document Ready
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await initData();
  await initProfile();
  setupEventListeners();
  handleRouting();
});

// Theme Logic
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.checked = savedTheme === "dark";
    themeToggle.addEventListener("change", (e) => {
      const theme = e.target.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      showToast(theme === "dark" ? "Mode Gelap Diaktifkan" : "Mode Terang Diaktifkan", "success");
      
      // Re-render charts to adjust text color for dark mode compatibility
      setTimeout(renderCharts, 100);
    });
  }
}

// Data Engine (Supabase & LocalStorage Fallback)
async function initData() {
  try {
    const { data, error } = await supabase
      .from('absensi_karyawan')
      .select('*');
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      const { error: seedError } = await supabase
        .from('absensi_karyawan')
        .insert(mockData);
      if (seedError) throw seedError;
      attendanceData = [...mockData];
    } else {
      attendanceData = data;
    }
  } catch (err) {
    console.error("Gagal memuat data dari Supabase, menggunakan LocalStorage:", err);
    const stored = localStorage.getItem("absensi_karyawan");
    if (!stored) {
      localStorage.setItem("absensi_karyawan", JSON.stringify(mockData));
      attendanceData = [...mockData];
    } else {
      attendanceData = JSON.parse(stored);
    }
  }
}

async function initProfile() {
  try {
    const { data, error } = await supabase
      .from('admin_profile')
      .select('*')
      .eq('id', 'admin_default')
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) {
      const { error: seedError } = await supabase
        .from('admin_profile')
        .insert({ id: 'admin_default', ...defaultProfile });
      if (seedError) throw seedError;
      profileData = { ...defaultProfile };
    } else {
      profileData = data;
    }
  } catch (err) {
    console.error("Gagal memuat profil dari Supabase, menggunakan LocalStorage:", err);
    const storedProfile = localStorage.getItem("admin_profile");
    if (!storedProfile) {
      localStorage.setItem("admin_profile", JSON.stringify(defaultProfile));
      profileData = { ...defaultProfile };
    } else {
      profileData = JSON.parse(storedProfile);
    }
  }
}

function renderProfile() {
  // Fill form fields
  document.getElementById("profileNama").value = profileData.nama || "";
  document.getElementById("profileNIP").value = profileData.nip || "";
  document.getElementById("profileEmail").value = profileData.email || "";
  document.getElementById("profilePhone").value = profileData.phone || "";
  document.getElementById("profileDepartment").value = profileData.department || "";
  document.getElementById("profileBio").value = profileData.bio || "";

  // Render left column card info
  document.getElementById("profileCardName").textContent = profileData.nama || "Admin";
  document.getElementById("profileCardRole").textContent = profileData.department || "Administrator";
  document.getElementById("profileCardBio").textContent = profileData.bio || "-";

  // Create Avatar Initials (up to 2 letters)
  const nameParts = (profileData.nama || "AD").trim().split(" ");
  let initials = "";
  if (nameParts.length > 0) {
    initials += nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
  }
  document.getElementById("profileAvatar").textContent = initials || "AD";

  // Calculate statistics (Total records in attendanceData)
  document.getElementById("profileStatTotalInput").textContent = attendanceData.length;
}

function saveData() {
  localStorage.setItem("absensi_karyawan", JSON.stringify(attendanceData));
  renderCharts();
  renderDashboard();
}

// SPA Routing Router
function handleRouting() {
  const hash = window.location.hash || "#dashboard";
  const views = ["dashboard", "list", "form", "profile"];
  
  // Clean all views
  views.forEach(v => {
    document.getElementById(`${v}View`).classList.remove("active");
  });
  
  // Highlight active sidebar menu
  document.querySelectorAll(".sidebar .nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === hash || (hash.startsWith("#form") && link.getAttribute("href") === "#form")) {
      link.classList.add("active");
    }
  });

  // Handle views activation and setups
  if (hash === "#dashboard") {
    document.getElementById("dashboardView").classList.add("active");
    renderDashboard();
  } else if (hash === "#list") {
    document.getElementById("listView").classList.add("active");
    renderList();
  } else if (hash.startsWith("#form")) {
    document.getElementById("formView").classList.add("active");
    setupFormView(hash);
  } else if (hash === "#profile") {
    document.getElementById("profileView").classList.add("active");
    renderProfile();
  }
}

// Setup Form View (Input vs Edit state)
function setupFormView(hash) {
  const formTitle = document.getElementById("formTitle");
  const formElement = document.getElementById("absensiForm");
  const btnSubmitText = document.getElementById("btnSubmitText");
  const btnSubmitIcon = document.getElementById("btnSubmitIcon");
  
  // Clear any validation errors
  clearValidationErrors();

  // Check if we are in Edit Mode
  const urlParams = new URLSearchParams(hash.split("?")[1]);
  const editId = urlParams.get("id");

  if (editId) {
    currentEditId = editId;
    formTitle.textContent = "Edit Data Absensi Karyawan";
    btnSubmitText.textContent = "Update Absen";
    btnSubmitIcon.className = "fas fa-save mr-2";
    
    // Fill the fields
    const record = attendanceData.find(item => item.id === editId);
    if (record) {
      document.getElementById("inputNama").value = record.nama;
      document.getElementById("inputAlamat").value = record.alamat;
      
      if (record.jenis_kelamin === "Laki-laki") {
        document.getElementById("genderL").checked = true;
      } else {
        document.getElementById("genderP").checked = true;
      }
      
      document.getElementById("inputTanggal").value = record.tanggal;
      document.getElementById("inputJamMasuk").value = record.jam_masuk;
      document.getElementById("inputJamKeluar").value = record.jam_keluar;
    } else {
      showToast("Data tidak ditemukan!", "danger");
      window.location.hash = "#list";
    }
  } else {
    currentEditId = null;
    formTitle.textContent = "Form Input Data Absensi Karyawan";
    btnSubmitText.textContent = "Simpan Absen";
    btnSubmitIcon.className = "fas fa-paper-plane mr-2";
    
    // Reset Form to default values
    formElement.reset();
    
    // Autofill current date and time for user convenience
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    document.getElementById("inputTanggal").value = localISOTime;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById("inputJamMasuk").value = `${hours}:${minutes}`;
    document.getElementById("inputJamKeluar").value = "17:00"; // Standard clock-out
  }
}

// Render Dashboard View
function renderDashboard() {
  // 1. Total Absensi
  const totalAbsen = attendanceData.length;
  document.getElementById("statTotalAbsen").textContent = totalAbsen;

  // 2. Today's Attendance
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAbsen = attendanceData.filter(item => item.tanggal === todayStr).length;
  document.getElementById("statHariIni").textContent = todayAbsen;

  // 3. Gender Statistics
  const maleCount = attendanceData.filter(item => item.jenis_kelamin === "Laki-laki").length;
  const femaleCount = attendanceData.filter(item => item.jenis_kelamin === "Perempuan").length;
  document.getElementById("statLakiLaki").textContent = maleCount;
  document.getElementById("statPerempuan").textContent = femaleCount;

  // 4. Average Attendance Time (Jam Masuk)
  let totalMinutes = 0;
  let validTimes = 0;
  attendanceData.forEach(item => {
    if (item.jam_masuk) {
      const [h, m] = item.jam_masuk.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        totalMinutes += (h * 60) + m;
        validTimes++;
      }
    }
  });
  
  if (validTimes > 0) {
    const avgMinutes = Math.round(totalMinutes / validTimes);
    const avgHours = String(Math.floor(avgMinutes / 60)).padStart(2, '0');
    const avgMins = String(avgMinutes % 60).padStart(2, '0');
    document.getElementById("statRerataMasuk").textContent = `${avgHours}:${avgMins}`;
  } else {
    document.getElementById("statRerataMasuk").textContent = "--:--";
  }

  // Render visual charts
  renderCharts();
}

// Render Chart.js Graphs
function renderCharts() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#a4b0be" : "#747d8c";
  const gridColor = isDark ? "#2a2f45" : "#e4e7ea";

  // Gender Chart
  const maleCount = attendanceData.filter(item => item.jenis_kelamin === "Laki-laki").length;
  const femaleCount = attendanceData.filter(item => item.jenis_kelamin === "Perempuan").length;
  
  const ctxGender = document.getElementById("genderChart").getContext("2d");
  
  if (genderChartInstance) {
    genderChartInstance.destroy();
  }
  
  genderChartInstance = new Chart(ctxGender, {
    type: "doughnut",
    data: {
      labels: ["Laki-laki", "Perempuan"],
      datasets: [{
        data: [maleCount, femaleCount],
        backgroundColor: ["#3498db", "#e74c3c"],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? "#1b1e2e" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            font: { family: "Outfit", size: 12 }
          }
        }
      }
    }
  });

  // Weekly Attendance Chart (grouped by date)
  // Get last 7 days of attendance
  const dateCounts = {};
  attendanceData.forEach(item => {
    dateCounts[item.tanggal] = (dateCounts[item.tanggal] || 0) + 1;
  });
  
  // Sort dates
  const sortedDates = Object.keys(dateCounts).sort().slice(-7);
  const chartLabels = sortedDates.map(date => {
    // Format date beautifully (DD/MM)
    const [y, m, d] = date.split("-");
    return `${d}/${m}`;
  });
  const chartData = sortedDates.map(date => dateCounts[date]);

  const ctxWeekly = document.getElementById("weeklyChart").getContext("2d");
  
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(ctxWeekly, {
    type: "bar",
    data: {
      labels: chartLabels.length > 0 ? chartLabels : ["Belum ada data"],
      datasets: [{
        label: "Jumlah Kehadiran",
        data: chartData.length > 0 ? chartData : [0],
        backgroundColor: "rgba(75, 108, 193, 0.85)",
        borderColor: "#4b6cc1",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "Outfit", size: 11 }
          }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "Outfit", size: 11 },
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  });
}

// Render List View (Table, Sorting, Pagination, Search)
function renderList() {
  let filteredData = [...attendanceData];
  
  // 1. Filter / Search
  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    filteredData = filteredData.filter(item => 
      item.nama.toLowerCase().includes(query) || 
      item.alamat.toLowerCase().includes(query)
    );
  }

  // 2. Sort By Column
  filteredData.sort((a, b) => {
    let valA = a[sortBy] ? a[sortBy].toLowerCase() : "";
    let valB = b[sortBy] ? b[sortBy].toLowerCase() : "";
    
    // Numeric/Date comparisons if needed
    if (sortBy === "tanggal") {
      valA = new Date(a.tanggal);
      valB = new Date(b.tanggal);
    }
    
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Update table header UI classes to show sort direction
  document.querySelectorAll("th.sortable").forEach(th => {
    th.classList.remove("asc", "desc");
    if (th.dataset.sort === sortBy) {
      th.classList.add(sortDirection);
    }
  });

  // 3. Pagination Setup
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Render Table Rows
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";

  if (paginatedData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-5">
          <i class="fas fa-folder-open fa-3x mb-3 d-block opacity-40"></i>
          Tidak ada data absensi karyawan ditemukan.
        </td>
      </tr>
    `;
  } else {
    paginatedData.forEach((item, index) => {
      const displayIndex = startIndex + index + 1;
      const genderBadge = item.jenis_kelamin === "Laki-laki" 
        ? `<span class="badge badge-gender-male"><i class="fas fa-mars mr-1"></i> Laki-laki</span>`
        : `<span class="badge badge-gender-female"><i class="fas fa-venus mr-1"></i> Perempuan</span>`;
      
      // Highlight clock-in delay (late after 08:00)
      const isLate = item.jam_masuk > "08:00";
      const timeInBadge = isLate
        ? `<span class="text-danger font-weight-bold"><i class="fas fa-exclamation-circle mr-1"></i> ${item.jam_masuk} (Terlambat)</span>`
        : `<span class="text-success font-weight-bold"><i class="fas fa-check-circle mr-1"></i> ${item.jam_masuk}</span>`;

      tbody.innerHTML += `
        <tr class="animated fadeIn">
          <td class="text-center font-weight-bold">${displayIndex}</td>
          <td class="font-weight-bold">${escapeHTML(item.nama)}</td>
          <td>${escapeHTML(item.alamat)}</td>
          <td>${genderBadge}</td>
          <td><i class="far fa-calendar-alt text-muted mr-1"></i> ${formatIndonesianDate(item.tanggal)}</td>
          <td>${timeInBadge}</td>
          <td><i class="far fa-clock text-muted mr-1"></i> ${item.jam_keluar || "--:--"}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-info btn-action mr-1 text-white" onclick="editRecord('${item.id}')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-action" onclick="confirmDeleteRecord('${item.id}', '${escapeHTML(item.nama)}')" title="Hapus">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });
  }

  // Render Pagination Buttons
  renderPagination(totalPages, totalItems, startIndex, endIndex);
}

// Pagination Controls UI Builder
function renderPagination(totalPages, totalItems, startIndex, endIndex) {
  const paginationEl = document.getElementById("tablePagination");
  paginationEl.innerHTML = "";

  // Show page metrics
  const infoEl = document.getElementById("tableInfo");
  if (totalItems > 0) {
    infoEl.textContent = `Menampilkan ${startIndex + 1} - ${Math.min(endIndex, totalItems)} dari ${totalItems} data karyawan`;
  } else {
    infoEl.textContent = "Menampilkan 0 data";
  }

  // Prev Button
  const prevDisabled = currentPage === 1 ? "disabled" : "";
  paginationEl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})" aria-label="Previous">
        <i class="fas fa-chevron-left"></i>
      </a>
    </li>
  `;

  // Number Buttons
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = currentPage === i ? "active" : "";
    paginationEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Next Button
  const nextDisabled = currentPage === totalPages ? "disabled" : "";
  paginationEl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})" aria-label="Next">
        <i class="fas fa-chevron-right"></i>
      </a>
    </li>
  `;
}

// Global actions exposed to HTML
window.changePage = function(page) {
  currentPage = page;
  renderList();
};

window.editRecord = function(id) {
  window.location.hash = `#form?id=${id}`;
};

// Global pointer for delete
let recordIdToDelete = null;

window.confirmDeleteRecord = function(id, name) {
  recordIdToDelete = id;
  document.getElementById("deleteEmployeeName").textContent = name;
  $("#deleteConfirmModal").modal("show");
};

window.executeDeleteRecord = async function() {
  if (recordIdToDelete) {
    try {
      const { error } = await supabase
        .from('absensi_karyawan')
        .delete()
        .eq('id', recordIdToDelete);
      if (error) throw error;
    } catch (err) {
      console.error("Gagal menghapus dari database online, menggunakan lokal:", err);
    }
    attendanceData = attendanceData.filter(item => item.id !== recordIdToDelete);
    saveData();
    $("#deleteConfirmModal").modal("hide");
    showToast("Data absensi karyawan berhasil dihapus!", "success");
    renderList();
    recordIdToDelete = null;
  }
};

// Form Validation and submission handler
function validateForm(data) {
  let isValid = true;
  clearValidationErrors();

  if (!data.nama.trim()) {
    showError("inputNama", "Nama wajib diisi");
    isValid = false;
  }
  if (!data.alamat.trim()) {
    showError("inputAlamat", "Alamat wajib diisi");
    isValid = false;
  }
  if (!data.jenis_kelamin) {
    showError("inputGender", "Pilih jenis kelamin");
    isValid = false;
  }
  if (!data.tanggal) {
    showError("inputTanggal", "Tanggal absen wajib diisi");
    isValid = false;
  }
  if (!data.jam_masuk) {
    showError("inputJamMasuk", "Jam masuk wajib diisi");
    isValid = false;
  }
  if (!data.jam_keluar) {
    showError("inputJamKeluar", "Jam keluar wajib diisi");
    isValid = false;
  } else if (data.jam_keluar <= data.jam_masuk) {
    showError("inputJamKeluar", "Jam keluar harus setelah jam masuk");
    isValid = false;
  }

  return isValid;
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add("is-invalid");
    
    // Add feedback div if not present
    let feedback = field.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "invalid-feedback font-weight-bold";
      field.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  } else if (fieldId === "inputGender") {
    // Special handling for radio cards
    const wrapper = document.querySelector(".gender-selector");
    let feedback = wrapper.parentElement.querySelector(".gender-feedback-error");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "text-danger font-weight-bold mt-1 gender-feedback-error";
      feedback.style.fontSize = "80%";
      wrapper.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  }
}

function clearValidationErrors() {
  document.querySelectorAll(".is-invalid").forEach(el => {
    el.classList.remove("is-invalid");
  });
  document.querySelectorAll(".invalid-feedback").forEach(el => {
    el.remove();
  });
  const genderFeedback = document.querySelector(".gender-feedback-error");
  if (genderFeedback) genderFeedback.remove();
}

// Setup listeners
function setupEventListeners() {
  // SPA routing listener
  window.addEventListener("hashchange", handleRouting);

  // Search input typing listener with debounce
  const searchInput = document.getElementById("searchBar");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      currentPage = 1; // reset page on search
      renderList();
    });
  }

  // Entries count dropdown listener
  const entriesSelect = document.getElementById("entriesSelect");
  if (entriesSelect) {
    entriesSelect.addEventListener("change", (e) => {
      itemsPerPage = parseInt(e.target.value);
      currentPage = 1;
      renderList();
    });
  }

  // Sortable headers click listeners
  document.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const requestedSort = th.dataset.sort;
      if (sortBy === requestedSort) {
        // Toggle direction
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortBy = requestedSort;
        sortDirection = "asc";
      }
      renderList();
    });
  });

  // Form Submission
  const formElement = document.getElementById("absensiForm");
  if (formElement) {
    formElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const genderEl = document.querySelector('input[name="gender"]:checked');
      const formData = {
        nama: document.getElementById("inputNama").value,
        alamat: document.getElementById("inputAlamat").value,
        jenis_kelamin: genderEl ? genderEl.value : "",
        tanggal: document.getElementById("inputTanggal").value,
        jam_masuk: document.getElementById("inputJamMasuk").value,
        jam_keluar: document.getElementById("inputJamKeluar").value
      };

      if (!validateForm(formData)) {
        showToast("Mohon perbaiki isian form absensi yang salah", "danger");
        return;
      }

      try {
        if (currentEditId) {
          // UPDATE MODE in Supabase
          const { error } = await supabase
            .from('absensi_karyawan')
            .update(formData)
            .eq('id', currentEditId);
          if (error) throw error;

          const index = attendanceData.findIndex(item => item.id === currentEditId);
          if (index !== -1) {
            attendanceData[index] = { ...attendanceData[index], ...formData };
          }
          saveData();
          showToast(`Data absensi ${formData.nama} berhasil diperbarui!`, "success");
          window.location.hash = "#list";
        } else {
          // INSERT MODE in Supabase
          const newRecord = {
            id: Date.now().toString(),
            ...formData
          };
          const { error } = await supabase
            .from('absensi_karyawan')
            .insert(newRecord);
          if (error) throw error;

          attendanceData.push(newRecord);
          saveData();
          showToast(`Data absensi ${formData.nama} berhasil ditambahkan!`, "success");
          window.location.hash = "#list";
        }
      } catch (err) {
        console.error("Gagal menyimpan ke database online, menggunakan lokal:", err);
        // Fallback to local
        if (currentEditId) {
          const index = attendanceData.findIndex(item => item.id === currentEditId);
          if (index !== -1) {
            attendanceData[index] = { ...attendanceData[index], ...formData };
          }
        } else {
          const newRecord = {
            id: Date.now().toString(),
            ...formData
          };
          attendanceData.push(newRecord);
        }
        saveData();
        showToast("Tersimpan secara lokal (offline)", "warning");
        window.location.hash = "#list";
      }
    });
  }

  // Profile Form Submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearValidationErrors();

      const updatedProfile = {
        nama: document.getElementById("profileNama").value,
        nip: document.getElementById("profileNIP").value,
        email: document.getElementById("profileEmail").value,
        phone: document.getElementById("profilePhone").value,
        department: document.getElementById("profileDepartment").value,
        bio: document.getElementById("profileBio").value
      };

      let isValid = true;
      if (!updatedProfile.nama.trim()) {
        showError("profileNama", "Nama lengkap wajib diisi");
        isValid = false;
      }
      if (!updatedProfile.email.trim()) {
        showError("profileEmail", "Email wajib diisi");
        isValid = false;
      }

      if (!isValid) {
        showToast("Mohon lengkapi kolom yang wajib diisi", "danger");
        return;
      }

      try {
        const { error } = await supabase
          .from('admin_profile')
          .upsert({ id: 'admin_default', ...updatedProfile });
        if (error) throw error;
      } catch (err) {
        console.error("Gagal menyimpan profil ke database online, menggunakan lokal:", err);
      }

      profileData = updatedProfile;
      localStorage.setItem("admin_profile", JSON.stringify(profileData));
      renderProfile();
      showToast("Profil admin berhasil diperbarui!", "success");
    });
  }

  // Reset and Re-seed button in the list or dashboard
  const seedBtn = document.getElementById("btnResetSeed");
  if (seedBtn) {
    seedBtn.addEventListener("click", async () => {
      if (confirm("Apakah Anda yakin ingin menyetel ulang data ke data simulasi? Seluruh data kustom Anda akan terhapus.")) {
        try {
          // Delete all
          const { error: deleteError } = await supabase
             .from('absensi_karyawan')
             .delete()
             .neq('id', '0'); // deletes all
          if (deleteError) throw deleteError;

          // Re-insert
          const { error: seedError } = await supabase
             .from('absensi_karyawan')
             .insert(mockData);
          if (seedError) throw seedError;

          localStorage.removeItem("absensi_karyawan");
          attendanceData = [...mockData];
          saveData();
          showToast("Database disetel ulang ke data simulasi!", "warning");
          handleRouting();
        } catch (err) {
          console.error("Gagal mereset database online, mereset secara lokal:", err);
          localStorage.removeItem("absensi_karyawan");
          initData();
          saveData();
          showToast("Database disetel ulang secara lokal!", "warning");
          handleRouting();
        }
      }
    });
  }

  // Sidebar mobile toggle button
  const burgerBtn = document.getElementById("sidebarTogglerButton");
  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-show");
    });
  }
  
  // Close mobile sidebar on menu navigation
  document.querySelectorAll(".sidebar .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992) {
        document.body.classList.remove("sidebar-show");
      }
    });
  });
}

// Helpers
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function formatIndonesianDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${monthName} ${year}`;
}

// Toast Notification Manager
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  
  let icon = "fa-check-circle";
  if (type === "warning") icon = "fa-exclamation-triangle";
  if (type === "danger") icon = "fa-times-circle";

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <div class="font-weight-bold">${message}</div>
  `;

  container.appendChild(toast);
  
  // Slide in
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // Slide out and remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
