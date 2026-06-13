import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '../../components/ui';
import { createPet } from '../../api/pet.api';
import { getErrorMessage } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const speciesOptions = ['Dog', 'Cat', 'Rabbit', 'Mouse', 'Fish', 'Parrot', 'Other'];
const genderOptions = ['Male', 'Female', 'Unknown'];

export default function AddPetPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [ownedSince, setOwnedSince] = useState('');
  const [breed, setBreed] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [colour, setColour] = useState('');
  const [gender, setGender] = useState('Unknown');
  const [photo, setPhoto] = useState(null); // File object
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file); // Store File object — NOT a URL
    setPreview(URL.createObjectURL(file)); // Preview URL only for display
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Validate required fields first — set errors, return early if invalid
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Pet name is required';
    if (!species) newErrors.species = 'Species is required';
    if (!breed.trim()) newErrors.breed = 'Breed is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // 2. Build FormData correctly
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('species', species.toLowerCase()); // ensure lowercase
      formData.append('breed', breed.trim());
      formData.append('age', parseInt(age) || 0);
      formData.append('weight', parseFloat(weight) || 0);
      formData.append('colour', colour.trim());
      formData.append('gender', gender.toLowerCase()); // ensure lowercase

      // Extract year from YYYY-MM-DD input or default to current year
      let year = new Date().getFullYear();
      if (ownedSince) {
        const parsedYear = parseInt(ownedSince.split('-')[0]) || parseInt(ownedSince);
        if (parsedYear) {
          year = parsedYear;
        }
      }
      formData.append('ownedSince', year);

      if (photo) formData.append('photo', photo); // File object, not URL

      // 3. Call API — uses multipart/form-data header set in pet.api.js
      const response = await createPet(formData);
      const newPet = response.data?.pet || response.data;

      addToast(`✓ ${name} added successfully!`, 'success');
      navigate(`/pets/${newPet._id}`);
    } catch (error) {
      addToast(getErrorMessage(error) || 'Failed to add pet. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="container-app px-10 py-5">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard" className="font-semibold text-neutral-600 hover:text-primary-600">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="container-app max-w-[700px] px-10">
        <Card className="p-7">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <p className="text-label-lg text-neutral-900">Pet photo</p>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-3xl text-neutral-400">
                  {preview ? <img src={preview} alt="Pet preview" className="h-full w-full rounded-2xl object-cover" /> : '+'}
                </button>
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>Choose file</Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Pet name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <Input label="Owned since" type="date" value={ownedSince} onChange={(e) => setOwnedSince(e.target.value)} error={errors.ownedSince} />
              <Input label="Breed" required value={breed} onChange={(e) => setBreed(e.target.value)} error={errors.breed} />
              <Select label="Species" required value={species} onChange={(e) => setSpecies(e.target.value)} error={errors.species}>
                {speciesOptions.map((option) => <option key={option}>{option}</option>)}
              </Select>
              <Input label="Weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <Input label="Colour" value={colour} onChange={(e) => setColour(e.target.value)} />
              <Select label="Gender" required value={gender} onChange={(e) => setGender(e.target.value)} error={errors.gender}>
                {genderOptions.map((option) => <option key={option}>{option}</option>)}
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
              <Button type="submit" loading={loading}>Add pet</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}