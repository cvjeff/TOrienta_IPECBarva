// Inicialización de los datos
let students = JSON.parse(localStorage.getItem('students')) || [];
let attentions = JSON.parse(localStorage.getItem('attentions')) || [];

const studentForm = document.getElementById('studentForm');
const attentionForm = document.getElementById('attentionForm');
const studentList = document.getElementById('studentList');
const attentionList = document.getElementById('attentionList');
const sortStudentsBtn = document.getElementById('sortStudents');

// Función para guardar datos en localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attentions', JSON.stringify(attentions));
}

// Función para renderizar la lista de estudiantes
function renderStudents() {
    studentList.innerHTML = '';
    students.forEach(student => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${student.nombre} ${student.primerApellido} ${student.segundoApellido}</span>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
            <button class="print-btn">Imprimir Reporte</button>
        `;
        
        li.querySelector('.edit-btn').onclick = () => editStudent(student);
        li.querySelector('.delete-btn').onclick = () => deleteStudent(student.id);
        li.querySelector('.print-btn').onclick = () => printReport(student.id);

        studentList.appendChild(li);
    });

    const studentSelect = document.getElementById('studentId');
    studentSelect.innerHTML = '<option value="">Seleccione un estudiante</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.nombre} ${student.primerApellido} ${student.segundoApellido}`;
        studentSelect.appendChild(option);
    });
}

// Función para renderizar la lista de atenciones agrupadas por estudiante
function renderAttentions() {
    attentionList.innerHTML = '';
    const groupedAttentions = {};

    attentions.forEach(attention => {
        if (!groupedAttentions[attention.studentId]) {
            groupedAttentions[attention.studentId] = [];
        }
        groupedAttentions[attention.studentId].push(attention);
    });

    for (const studentId in groupedAttentions) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student-attentions';
            studentDiv.innerHTML = `<h3>${student.nombre} ${student.primerApellido} ${student.segundoApellido}</h3>`;

            const attentionsList = document.createElement('ul');
            groupedAttentions[studentId].forEach(attention => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>Fecha:</strong> ${attention.fecha}<br>
                    <strong>Situación:</strong> ${attention.situacion}<br>
                    <strong>Referencia:</strong> ${attention.referencia ? 'Sí' : 'No'}<br>
                    ${attention.referencia ? `<strong>Instancia:</strong> ${attention.instancia}<br>` : ''}
                `;
                attentionsList.appendChild(li);
            });

            studentDiv.appendChild(attentionsList);
            attentionList.appendChild(studentDiv);
        }
    }
}

// Función para agregar un estudiante
function addStudent(e) {
    e.preventDefault();
    const student = {
        id: Date.now().toString(),
        identificacion: document.getElementById('identificacion').value,
        nombre: document.getElementById('nombre').value,
        primerApellido: document.getElementById('primerApellido').value,
        segundoApellido: document.getElementById('segundoApellido').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        areaEstudio: document.getElementById('areaEstudio').value
    };
    students.push(student);
    saveData();
    renderStudents();
    studentForm.reset();
    document.getElementById('edad').textContent = '';
}

// Función para editar un estudiante
function editStudent(student) {
    document.getElementById('identificacion').value = student.identificacion;
    document.getElementById('nombre').value = student.nombre;
    document.getElementById('primerApellido').value = student.primerApellido;
    document.getElementById('segundoApellido').value = student.segundoApellido;
    document.getElementById('fechaNacimiento').value = student.fechaNacimiento;
    document.getElementById('areaEstudio').value = student.areaEstudio;
    calculateAge();

    studentForm.onsubmit = (e) => {
        e.preventDefault();
        student.identificacion = document.getElementById('identificacion').value;
        student.nombre = document.getElementById('nombre').value;
        student.primerApellido = document.getElementById('primerApellido').value;
        student.segundoApellido = document.getElementById('segundoApellido').value;
        student.fechaNacimiento = document.getElementById('fechaNacimiento').value;
        student.areaEstudio = document.getElementById('areaEstudio').value;
        saveData();
        renderStudents();
        renderAttentions();
        studentForm.reset();
        document.getElementById('edad').textContent = '';
        studentForm.onsubmit = addStudent;
    };
}

// Función para eliminar un estudiante
function deleteStudent(id) {
    if (confirm('¿Está seguro de que desea eliminar este estudiante?')) {
        students = students.filter(s => s.id !== id);
        attentions = attentions.filter(a => a.studentId !== id);
        saveData();
        renderStudents();
        renderAttentions();
    }
}

// Función para agregar una atención
function addAttention(e) {
    e.preventDefault();
    const attention = {
        id: Date.now().toString(),
        studentId: document.getElementById('studentId').value,
        fecha: document.getElementById('fecha').value,
        situacion: document.getElementById('situacion').value,
        referencia: document.getElementById('referencia').checked,
        instancia: document.getElementById('instancia').value
    };
    attentions.push(attention);
    saveData();
    renderAttentions();
    attentionForm.reset();
}

// Función para imprimir el reporte de un estudiante
function printReport(studentId) {
    const student = students.find(s => s.id === studentId);
    const studentAttentions = attentions.filter(a => a.studentId === studentId);
    
    if (!student) return;

    let reportContent = `
        Reporte de Estudiante
        ---------------------
        Nombre: ${student.nombre} ${student.primerApellido} ${student.segundoApellido}
        Identificación: ${student.identificacion}
        Fecha de Nacimiento: ${student.fechaNacimiento}
        Área de Estudio: ${student.areaEstudio}

        Atenciones:
        -----------
    `;

    studentAttentions.forEach(attention => {
        reportContent += `
            Fecha: ${attention.fecha}
            Situación: ${attention.situacion}
            Referencia: ${attention.referencia ? 'Sí' : 'No'}
            ${attention.referencia ? `Instancia: ${attention.instancia}` : ''}
            -------------------------
        `;
    });

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<pre>' + reportContent + '</pre>');
        printWindow.document.close();
        printWindow.print();
    }
}

// Función para ordenar estudiantes por nombre
function sortStudentsByName() {
    students.sort((a, b) => a.nombre.localeCompare(b.nombre));
    saveData();
    renderStudents();
}

// Función para calcular la edad
function calculateAge() {
    const birthDate = new Date(document.getElementById('fechaNacimiento').value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('edad').textContent = `Edad: ${age}`;
}

// Event listeners
studentForm.addEventListener('submit', addStudent);
attentionForm.addEventListener('submit', addAttention);
sortStudentsBtn.addEventListener('click', sortStudentsByName);
document.getElementById('fechaNacimiento').addEventListener('change', calculateAge);
document.getElementById('referencia').addEventListener('change', function() {
    document.getElementById('instancia').style.display = this.checked ? 'block' : 'none';
});

// Inicialización
renderStudents();
renderAttentions();