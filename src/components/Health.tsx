import { useEffect, useState } from 'react';
import { supabase, Child, GrowthRecord, ImmunizationRecord } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Heart, TrendingUp, Calendar, Syringe, Plus, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';
import { MPASI } from './MPASI';

export function Health() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'growth' | 'immunization' | 'mpasi'>('growth');
  const [children, setChildren] = useState<Child[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [showAddGrowth, setShowAddGrowth] = useState(false);
  const [showAddVaccine, setShowAddVaccine] = useState(false);

  const [newGrowth, setNewGrowth] = useState({
    child_id: '',
    record_date: new Date().toISOString().split('T')[0],
    height_cm: '',
    weight_kg: '',
  });

  const [newVaccine, setNewVaccine] = useState({
    child_id: '',
    vaccine_name: '',
    scheduled_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: childrenData } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (childrenData) {
      setChildren(childrenData);
      if (childrenData.length > 0) {
        if (!newGrowth.child_id) setNewGrowth({ ...newGrowth, child_id: childrenData[0].id });
        if (!newVaccine.child_id) setNewVaccine({ ...newVaccine, child_id: childrenData[0].id });

        const childIds = childrenData.map(c => c.id);

        const { data: growthData } = await supabase
          .from('growth_records')
          .select('*')
          .in('child_id', childIds)
          .order('record_date', { ascending: false });

        if (growthData) setGrowthRecords(growthData);

        const { data: vaccineData } = await supabase
          .from('immunization_records')
          .select('*')
          .in('child_id', childIds)
          .order('scheduled_date', { ascending: true });

        if (vaccineData) setImmunizationRecords(vaccineData);
      }
    }
  };

  const calculateBMI = (heightCm: number, weightKg: number, ageMonths: number): string => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    if (ageMonths < 24) {
      if (bmi < 14) return 'Kurang';
      if (bmi < 18) return 'Normal';
      return 'Berlebih';
    } else if (ageMonths < 60) {
      if (bmi < 14.5) return 'Kurang';
      if (bmi < 17) return 'Normal';
      return 'Berlebih';
    } else {
      if (bmi < 15) return 'Kurang';
      if (bmi < 18.5) return 'Normal';
      return 'Berlebih';
    }
  };

  const handleAddGrowth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrowth.child_id || !newGrowth.height_cm || !newGrowth.weight_kg) return;

    const child = children.find(c => c.id === newGrowth.child_id);
    if (!child) return;

    const birthDate = new Date(child.birth_date);
    const recordDate = new Date(newGrowth.record_date);
    const ageMonths = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
                     (recordDate.getMonth() - birthDate.getMonth());

    const status = calculateBMI(
      parseFloat(newGrowth.height_cm),
      parseFloat(newGrowth.weight_kg),
      ageMonths
    );

    const { error } = await supabase
      .from('growth_records')
      .insert({
        child_id: newGrowth.child_id,
        record_date: newGrowth.record_date,
        height_cm: parseFloat(newGrowth.height_cm),
        weight_kg: parseFloat(newGrowth.weight_kg),
        status,
      });

    if (!error) {
      setNewGrowth({
        child_id: children[0]?.id || '',
        record_date: new Date().toISOString().split('T')[0],
        height_cm: '',
        weight_kg: '',
      });
      setShowAddGrowth(false);
      loadData();
    }
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.child_id || !newVaccine.vaccine_name) return;

    const { error } = await supabase
      .from('immunization_records')
      .insert({
        child_id: newVaccine.child_id,
        vaccine_name: newVaccine.vaccine_name,
        scheduled_date: newVaccine.scheduled_date,
        completed: false,
      });

    if (!error) {
      setNewVaccine({
        child_id: children[0]?.id || '',
        vaccine_name: '',
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      setShowAddVaccine(false);
      loadData();
    }
  };

  const toggleVaccineComplete = async (vaccine: ImmunizationRecord) => {
    const { error } = await supabase
      .from('immunization_records')
      .update({
        completed: !vaccine.completed,
        completed_date: !vaccine.completed ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', vaccine.id);

    if (!error) loadData();
  };

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || 'Anak';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Normal') return 'bg-green-100 text-green-700';
    if (status === 'Kurang') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-7 h-7 text-red-600" />
          Kesehatan Keluarga
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          <button
            onClick={() => setActiveTab('growth')}
            className={`flex-1 px-6 py-4 font-medium transition text-left sm:text-center border-b sm:border-b-0 sm:border-r ${
              activeTab === 'growth'
                ? 'bg-blue-50 text-blue-600 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Tumbuh Kembang
          </button>
          <button
            onClick={() => setActiveTab('immunization')}
            className={`flex-1 px-6 py-4 font-medium transition text-left sm:text-center border-b sm:border-b-0 sm:border-r ${
              activeTab === 'immunization'
                ? 'bg-blue-50 text-blue-600 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Syringe className="w-5 h-5 inline mr-2" />
            Imunisasi
          </button>
          <button
            onClick={() => setActiveTab('mpasi')}
            className={`flex-1 px-6 py-4 font-medium transition text-left sm:text-center ${
              activeTab === 'mpasi'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChefHat className="w-5 h-5 inline mr-2" />
            Resep MPASI
          </button>
        </div>

        <div className="p-6">
          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tambahkan data anak terlebih dahulu di halaman Beranda</p>
            </div>
          ) : (
            <>
              {activeTab === 'growth' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAddGrowth(!showAddGrowth)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Catat Tumbuh Kembang
                  </button>

                  {showAddGrowth && (
                    <form onSubmit={handleAddGrowth} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <select
                        value={newGrowth.child_id}
                        onChange={(e) => setNewGrowth({ ...newGrowth, child_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        {children.map(child => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={newGrowth.record_date}
                        onChange={(e) => setNewGrowth({ ...newGrowth, record_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Tinggi (cm)"
                          value={newGrowth.height_cm}
                          onChange={(e) => setNewGrowth({ ...newGrowth, height_cm: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          required
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Berat (kg)"
                          value={newGrowth.weight_kg}
                          onChange={(e) => setNewGrowth({ ...newGrowth, weight_kg: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddGrowth(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}

                  {growthRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada catatan tumbuh kembang</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {growthRecords.map((record) => (
                        <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{getChildName(record.child_id)}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(record.record_date).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Tinggi Badan</p>
                              <p className="text-lg font-bold text-gray-900">{record.height_cm} cm</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Berat Badan</p>
                              <p className="text-lg font-bold text-gray-900">{record.weight_kg} kg</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'immunization' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAddVaccine(!showAddVaccine)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Jadwal Imunisasi
                  </button>

                  {showAddVaccine && (
                    <form onSubmit={handleAddVaccine} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <select
                        value={newVaccine.child_id}
                        onChange={(e) => setNewVaccine({ ...newVaccine, child_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        {children.map(child => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </select>

                      <select
                        value={newVaccine.vaccine_name}
                        onChange={(e) => setNewVaccine({ ...newVaccine, vaccine_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Pilih Vaksin</option>
                        <option value="BCG">BCG</option>
                        <option value="Hepatitis B">Hepatitis B</option>
                        <option value="Polio">Polio</option>
                        <option value="DPT">DPT</option>
                        <option value="Campak">Campak</option>
                        <option value="MMR">MMR</option>
                        <option value="Hib">Hib</option>
                        <option value="Rotavirus">Rotavirus</option>
                        <option value="PCV">PCV</option>
                      </select>

                      <input
                        type="date"
                        value={newVaccine.scheduled_date}
                        onChange={(e) => setNewVaccine({ ...newVaccine, scheduled_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddVaccine(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}

                  {immunizationRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Syringe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Belum ada jadwal imunisasi</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {immunizationRecords.map((vaccine) => (
                        <div
                          key={vaccine.id}
                          className={`border rounded-xl p-4 cursor-pointer transition ${
                            vaccine.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => toggleVaccineComplete(vaccine)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{vaccine.vaccine_name}</h4>
                                {vaccine.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{getChildName(vaccine.child_id)}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                <Calendar className="w-3 h-3" />
                                Jadwal: {new Date(vaccine.scheduled_date).toLocaleDateString('id-ID')}
                              </div>
                              {vaccine.completed && vaccine.completed_date && (
                                <p className="text-xs text-green-600 mt-1">
                                  Selesai: {new Date(vaccine.completed_date).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mpasi' && (
                <div className="space-y-4">
                  <MPASI />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
