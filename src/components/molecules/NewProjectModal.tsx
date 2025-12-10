import type { FC } from 'react';
import { useState } from 'react';
import { Modal } from './Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { PROJECT_TEMPLATES } from '@/constants';
import styled from 'styled-components';
import { Code2, FileText, Folder } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: { name: string; template: string; description?: string }) => void;
}

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const TemplateCard = styled.div<{ $isSelected: boolean }>`
  cursor: pointer;
  transition: all var(--duration-medium) var(--easing-ease-out);
  border: 2px solid ${props => (props.$isSelected ? 'var(--color-primary)' : 'var(--color-border)')};

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-colored-primary);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const TemplateIcon = styled.span`
  font-size: var(--font-size-xl);
`;

const TemplateTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
`;

const TemplateDescription = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
`;

const FormSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
`;

export const NewProjectModal: FC<NewProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(PROJECT_TEMPLATES[0].id);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);

    try {
      const projectData = {
        name: projectName.trim(),
        template: selectedTemplate,
        ...(projectDescription.trim() && { description: projectDescription.trim() }),
      };

      await onCreateProject(projectData);


      setProjectName('');
      setProjectDescription('');
      setSelectedTemplate(PROJECT_TEMPLATES[0].id);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      size="lg"
      closeOnOverlayClick={!isCreating}
      closeOnEscape={!isCreating}
    >
      <FormSection>
        <FormLabel htmlFor="project-name">
          <Folder size={16} style={{ marginRight: '0.5rem' }} />
          Project Name
        </FormLabel>
        <Input
          id="project-name"
          placeholder="Enter project name"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          disabled={isCreating}
          required
          autoFocus
        />
      </FormSection>

      <FormSection>
        <FormLabel htmlFor="project-description">
          <FileText size={16} style={{ marginRight: '0.5rem' }} />
          Description (Optional)
        </FormLabel>
        <Input
          id="project-description"
          placeholder="Brief description of your project"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
          disabled={isCreating}
        />
      </FormSection>

      <FormSection>
        <FormLabel>
          <Code2 size={16} style={{ marginRight: '0.5rem' }} />
          Choose Template
        </FormLabel>
        <TemplateGrid>
          {PROJECT_TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              $isSelected={selectedTemplate === template.id}
              onClick={() => !isCreating && setSelectedTemplate(template.id)}
            >
              <TemplateHeader>
                <TemplateIcon>{template.icon}</TemplateIcon>
                <TemplateTitle>{template.name}</TemplateTitle>
              </TemplateHeader>
              <TemplateDescription>{template.description}</TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateGrid>
      </FormSection>

      <ButtonGroup>
        <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={!projectName.trim() || isCreating}
          loading={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Project'}
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default NewProjectModal;
