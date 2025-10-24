import { DataSource } from 'typeorm';
import { Stage, StageType } from '../../modules/stages/entities/stage.entity';

export async function seedStages(dataSource: DataSource) {
  const stageRepository = dataSource.getRepository(Stage);

  // Define production stages for door manufacturing
  const stagesData = [
    {
      name: 'Order Received',
      description: 'New order received and awaiting processing',
      order: 1,
      type: StageType.SEQUENTIAL,
      isDefault: true,
      estimatedDurationHours: 1,
      colorCode: '#3B82F6',
      iconName: 'inbox',
    },
    {
      name: 'Design & Measurement',
      description: 'Customer measurements taken and design specifications created',
      order: 2,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 8,
      colorCode: '#8B5CF6',
      iconName: 'ruler',
    },
    {
      name: 'Material Preparation',
      description: 'Materials cut and prepared for assembly',
      order: 3,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 16,
      colorCode: '#10B981',
      iconName: 'scissors',
    },
    {
      name: 'Frame Assembly',
      description: 'Door frame assembled and welded',
      order: 4,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 24,
      colorCode: '#F59E0B',
      iconName: 'hammer',
    },
    {
      name: 'Surface Treatment',
      description: 'Grinding, sanding, and surface preparation',
      order: 5,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 12,
      colorCode: '#EF4444',
      iconName: 'spray-can',
    },
    {
      name: 'Painting & Coating',
      description: 'Painting and protective coating application',
      order: 6,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 20,
      colorCode: '#EC4899',
      iconName: 'palette',
    },
    {
      name: 'Hardware Installation',
      description: 'Locks, hinges, and other hardware installed',
      order: 7,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 4,
      colorCode: '#6366F1',
      iconName: 'wrench',
    },
    {
      name: 'Quality Control',
      description: 'Final inspection and quality assurance',
      order: 8,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 2,
      colorCode: '#14B8A6',
      iconName: 'check-circle',
    },
    {
      name: 'Packaging',
      description: 'Product packaged for delivery',
      order: 9,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 2,
      colorCode: '#A855F7',
      iconName: 'package',
    },
    {
      name: 'Ready for Delivery',
      description: 'Order ready for shipment or pickup',
      order: 10,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 0,
      colorCode: '#059669',
      iconName: 'truck',
    },
    {
      name: 'Delivered',
      description: 'Order delivered to customer',
      order: 11,
      type: StageType.SEQUENTIAL,
      estimatedDurationHours: 0,
      colorCode: '#22C55E',
      iconName: 'check-double',
    },
  ];

  // Create stages
  for (const stageData of stagesData) {
    const existingStage = await stageRepository.findOne({
      where: { name: stageData.name },
    });

    if (!existingStage) {
      const stage = stageRepository.create({
        ...stageData,
        isActive: true,
      });
      await stageRepository.save(stage);
      console.log(`  ✓ Created stage: ${stageData.name}`);
    } else {
      console.log(`  ⊘ Stage already exists: ${stageData.name}`);
    }
  }
}
