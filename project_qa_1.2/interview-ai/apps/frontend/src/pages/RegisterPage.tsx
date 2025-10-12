import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomSelect from '../components/CustomSelect'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
        phone: '', birthDate: '', gender: '', city: '', country: '',
        educationLevel: '', institution: '', fieldOfStudy: '', estado: '', certifications: '',
        yearsOfExperience: '', currentPosition: '', currentCompany: '', previousPositions: '',
        skills: [] as string[], languages: [] as string[],
        desiredPosition: '', desiredSalary: '', availability: '', willingToRelocate: false,
        workMode: '', aboutMe: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [newSkill, setNewSkill] = useState('')
    const [newLang, setNewLang] = useState('')

    const set = (field: string, value: any) => {
        setForm(f => ({ ...f, [field]: value }))
        errors[field] && setErrors(e => { const n = { ...e }; delete n[field]; return n })
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (currentStep === 1) {
            if (!form.firstName.trim()) e.firstName = 'Requerido'
            if (!form.lastName.trim()) e.lastName = 'Requerido'
            if (!form.email.trim()) e.email = 'Requerido'
            else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Inválido'
            if (!form.password) e.password = 'Requerida'
            else if (form.password.length < 6) e.password = 'Mín 6'
            if (form.password !== form.confirmPassword) e.confirmPassword = 'No coinciden'
            if (!form.phone.trim()) e.phone = 'Requerido'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const next = () => validate() && setCurrentStep(s => Math.min(s + 1, 4))
    const prev = () => setCurrentStep(s => Math.max(s - 1, 1))
    const submit = async () => {
        if (!validate()) return
        try {
            const r = await fetch('http://localhost:3002/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            r.ok ? (alert('¡Éxito!'), navigate('/login')) : alert((await r.json()).error || 'Error')
        } catch {
            alert('Error de conexión')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 border border-cyan-400/30 rotate-45 animate-float"></div>
                <div className="absolute top-1/3 right-20 w-24 h-24 border border-purple-400/30 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 border border-cyan-400/20 rotate-[30deg] animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl animate-fade-in-up">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-black mb-1">
                        <span className="neon-text">Registro de</span> Candidato
                    </h1>
                    <p className="text-gray-400 text-sm">Completa tu perfil en 4 pasos</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-4 flex items-center justify-center gap-2">
                    {[1, 2, 3, 4].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ' + (currentStep >= s ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/50' : 'text-gray-500')}
                                style={currentStep < s ? {
                                    background: 'rgba(10, 10, 27, 0.7)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 245, 255, 0.3)'
                                } : undefined}
                            >
                                {s}
                            </div>
                            {i < 3 && <div className={'w-8 h-0.5 mx-1 ' + (currentStep > s ? 'bg-cyan-400' : 'bg-gray-700')} />}
                        </div>
                    ))}
                </div>

                <div className="glass-card p-5 max-h-[65vh] overflow-y-auto custom-scrollbar" style={{ border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 20px rgba(0,245,255,0.1)' }}>
                    {/* STEP 1: Personal Info */}
                    {currentStep === 1 && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-glow-pulse"></div>
                                <h2 className="text-cyan-400 font-bold uppercase tracking-wide text-sm">Información Personal</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Nombre *</label>
                                    <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.firstName ? 'border-red-400' : '')} placeholder="Juan" />
                                    {errors.firstName && <p className="text-red-400 text-xs mt-0.5">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Apellido *</label>
                                    <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.lastName ? 'border-red-400' : '')} placeholder="Pérez" />
                                    {errors.lastName && <p className="text-red-400 text-xs mt-0.5">{errors.lastName}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Email *</label>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.email ? 'border-red-400' : '')} placeholder="juan@ejemplo.com" />
                                    {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Teléfono *</label>
                                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.phone ? 'border-red-400' : '')} placeholder="+56 9 1234 5678" />
                                    {errors.phone && <p className="text-red-400 text-xs mt-0.5">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Contraseña *</label>
                                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.password ? 'border-red-400' : '')} placeholder="Mínimo 6" />
                                    {errors.password && <p className="text-red-400 text-xs mt-0.5">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Confirmar *</label>
                                    <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={'input-futuristic py-2 text-sm ' + (errors.confirmPassword ? 'border-red-400' : '')} placeholder="Repite" />
                                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-0.5">{errors.confirmPassword}</p>}
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Fecha de Nacimiento</label>
                                    <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className="input-futuristic py-2 text-sm date-input-cyan" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Género</label>
                                    <CustomSelect
                                        value={form.gender}
                                        onChange={v => set('gender', v)}
                                        options={['Masculino', 'Femenino', 'Otro']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Ciudad</label>
                                    <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Santiago" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">País</label>
                                    <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Chile" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Education */}
                    {currentStep === 2 && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-glow-pulse"></div>
                                <h2 className="text-purple-400 font-bold uppercase tracking-wide text-sm">Educación</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Nivel</label>
                                    <CustomSelect
                                        value={form.educationLevel}
                                        onChange={v => set('educationLevel', v)}
                                        options={['Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Doctorado']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Institución</label>
                                    <input type="text" value={form.institution} onChange={e => set('institution', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Universidad" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Campo</label>
                                    <input type="text" value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Ingeniería" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Estado</label>
                                    <CustomSelect
                                        value={form.estado}
                                        onChange={v => set('estado', v)}
                                        options={['En curso', 'Completado', 'Abandonado']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Certificaciones</label>
                                    <textarea value={form.certifications} onChange={e => set('certifications', e.target.value)} className="input-futuristic py-2 text-sm resize-none" rows={2} placeholder="AWS, PMP..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Experience */}
                    {currentStep === 3 && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-glow-pulse"></div>
                                <h2 className="text-green-400 font-bold uppercase tracking-wide text-sm">Experiencia</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Años Experiencia</label>
                                    <CustomSelect
                                        value={form.yearsOfExperience}
                                        onChange={v => set('yearsOfExperience', v)}
                                        options={['Sin experiencia', '0-1 años', '1-3 años', '3-5 años', '5-10 años', '+10 años']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                {form.yearsOfExperience && form.yearsOfExperience !== 'Sin experiencia' && (
                                    <>
                                        <div>
                                            <label className="text-cyan-400 text-xs font-medium mb-1 block">Cargo</label>
                                            <input type="text" value={form.currentPosition} onChange={e => set('currentPosition', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Dev Senior" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-cyan-400 text-xs font-medium mb-1 block">Empresa</label>
                                            <input type="text" value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Tech Corp" />
                                        </div>
                                    </>
                                )}
                                <div className="col-span-2">
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Exp. Previa</label>
                                    <textarea value={form.previousPositions} onChange={e => set('previousPositions', e.target.value)} className="input-futuristic py-2 text-sm resize-none" rows={2} placeholder="Trabajos anteriores..." />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Habilidades</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && newSkill.trim() && !form.skills.includes(newSkill.trim()) && (set('skills', [...form.skills, newSkill.trim()]), setNewSkill(''))}
                                            className="flex-1 input-futuristic py-2 text-sm"
                                            placeholder="React..."
                                        />
                                        <button
                                            onClick={() => newSkill.trim() && !form.skills.includes(newSkill.trim()) && (set('skills', [...form.skills, newSkill.trim()]), setNewSkill(''))}
                                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {form.skills.map(s => (
                                            <span key={s} className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs rounded-full flex items-center gap-1">
                                                {s}
                                                <button onClick={() => set('skills', form.skills.filter(x => x !== s))} className="hover:text-red-400"></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Idiomas</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newLang}
                                            onChange={e => setNewLang(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && newLang.trim() && !form.languages.includes(newLang.trim()) && (set('languages', [...form.languages, newLang.trim()]), setNewLang(''))}
                                            className="flex-1 input-futuristic py-2 text-sm"
                                            placeholder="Español..."
                                        />
                                        <button
                                            onClick={() => newLang.trim() && !form.languages.includes(newLang.trim()) && (set('languages', [...form.languages, newLang.trim()]), setNewLang(''))}
                                            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {form.languages.map(l => (
                                            <span key={l} className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs rounded-full flex items-center gap-1">
                                                {l}
                                                <button onClick={() => set('languages', form.languages.filter(x => x !== l))} className="hover:text-red-400"></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Preferences */}
                    {currentStep === 4 && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-glow-pulse"></div>
                                <h2 className="text-yellow-400 font-bold uppercase tracking-wide text-sm">Preferencias</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Posición Deseada</label>
                                    <input type="text" value={form.desiredPosition} onChange={e => set('desiredPosition', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="Senior Dev" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Salario</label>
                                    <input type="text" value={form.desiredSalary} onChange={e => set('desiredSalary', e.target.value)} className="input-futuristic py-2 text-sm" placeholder="-5K" />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Disponibilidad</label>
                                    <CustomSelect
                                        value={form.availability}
                                        onChange={v => set('availability', v)}
                                        options={['Inmediata', '2 semanas', '1 mes', '2 meses', 'Más de 2 meses']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                <div>
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Modalidad</label>
                                    <CustomSelect
                                        value={form.workMode}
                                        onChange={v => set('workMode', v)}
                                        options={['Remoto', 'Presencial', 'Híbrido']}
                                        placeholder="Seleccionar..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-cyan-400 text-xs font-medium mb-1 block">Sobre mí</label>
                                    <textarea value={form.aboutMe} onChange={e => set('aboutMe', e.target.value)} className="input-futuristic py-2 text-sm resize-none" rows={3} placeholder="Objetivos..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-700/50">
                        <button
                            onClick={prev}
                            disabled={currentStep === 1}
                            className={'px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-all text-sm ' + (currentStep === 1 ? 'opacity-30 cursor-not-allowed' : '')}
                        >
                            Anterior
                        </button>
                        {currentStep < 4 ? (
                            <button onClick={next} className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all text-sm shadow-lg shadow-cyan-400/30">
                                Siguiente
                            </button>
                        ) : (
                            <button onClick={submit} className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all text-sm shadow-lg shadow-cyan-400/30">
                                Completar
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-center mt-3">
                    <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-cyan-400 text-xs transition-colors">
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    )
}
